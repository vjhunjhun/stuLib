const Student = require("../../model/student");
const Request = require("../../model/request");
const Book = require("../../model/book");
const Lend = require("../../model/lend");
const SiteStat = require("../../model/siteStat");
module.exports.showRequestSection = (req,res)=>{
    res.render("students/request/index.ejs");
}

module.exports.showSentSection = async(req,res)=>{
    const reqStudent = await Student.findById(req.user._id,{requests:1}).populate({
        path:"requests",
        match:{"requestBy.id":{$eq : req.user._id}},
        options:{sort:{createdOn:-1}},
});
    const requests = reqStudent.requests;
    res.render("students/request/sent.ejs",{requests});
};

module.exports.showReceivedSection = async(req,res)=>{
    const reqStudent = await Student.findById(req.user._id, { requests: 1 })
  .populate({
    path: "requests",
    match: { "requestBy.id": { $ne: req.user._id } },
    options:{sort:{createdOn:-1}},
  });
    const requests = reqStudent.requests;
    res.render("students/request/receive.ejs",{requests});
};

module.exports.acceptReceivedRequest = async(req,res)=>{
    const reqId = req.params.reqid;
    const request = await Request.findByIdAndUpdate(reqId,{acceptedOn:Date.now(),requestStatus:"accepted"});
    const bookId = request.requestFor.id;
    if(request.isReturnRequest){
        const borrowerId = req.user._id;
         await Student.findByIdAndUpdate(borrowerId,{$pull:{borrowed:{book_id:bookId}}});
    let book = await Book.findByIdAndUpdate(
  bookId,
  { status:"available", isLent:false, isLentTo:null },
  { new: true, select: "lendHistory" }
);
let lendDoc = await Lend.findOne({_id:{$in:book.lendHistory},status:"borrowed"},{_id:1});
      if (!lendDoc) {
    req.flash("error", "Active lend record not found");
    return res.redirect("/student/borrowed");
  }
    await Lend.findByIdAndUpdate(lendDoc._id,{returnDate:Date.now(),status:"returned"});
        req.flash("success","Request Accepted");
    return res.redirect("/student/requests/received");
    }
    const senderId = request.requestBy.id;
    const sender = await Student.findById(senderId,{_id:0,username:1});
    const lend = new Lend({
        lendBy:{
            username:sender.username,
            lend_id:senderId,
        },
        status:"borrowed",
    });
    const lendDoc = await lend.save();
    await Book.findByIdAndUpdate(bookId,{
        $push:{lendHistory:lendDoc._id},
        $set:{
        isHold:false,isHeldBy:null,isLent:true,isLentTo:senderId
}});
    await Student.findByIdAndUpdate(senderId,{$push:{borrowed:
        {
        title:request.requestFor.title,
        book_id:bookId
    }
    }});
    await SiteStat.updateOne({},{$inc:{bookShared:1}});
    req.flash("success","Request Accepted");
    res.redirect("/student/requests/received");
};

module.exports.declineReceivedRequest = async (req,res)=>{
    let reqId = req.params.reqid;
    const request = await Request.findByIdAndUpdate(reqId,{declinedOn:Date.now(),requestStatus:"declined"});
    if(request.isBorrowRequest){
    const bookId = request.requestFor.id;
    await Book.findByIdAndUpdate(bookId,{isHold:false,status:"available",isHeldBy:null});
    }
    // await Student.findByIdAndUpdate(req.user._id,{$pull:{requests:{$eq:reqId}}});
    req.flash("success","Request declined");
    res.redirect("/student/requests/received");
}

module.exports.cancelSentRequest = async(req,res)=>{
    const reqId = req.params.reqid;
    const request = await Request.findByIdAndUpdate(reqId,{$set:{
        requestStatus:"cancelled",
        cancelledOn:Date.now(),
    }},{fields:{requestFor:1,isBorrowRequest:1}});
    if(request.isBorrowRequest){
    const bookId = request.requestFor.id;
    await Book.findByIdAndUpdate(bookId,{isHold:false,status:"available",isHeldBy:null});
    }
    req.flash("success","Request Cancelled!");
    res.redirect("/student/requests/sent");
}

module.exports.removeSentRequest = async(req,res)=>{
    const reqId = req.params.reqid;
    const studentId = req.user._id;
    await Student.findByIdAndUpdate(studentId,{$pull:{requests:reqId}});
    req.flash("success","Request removed!");
    res.redirect("/student/requests/sent");
}

module.exports.removeReceivedRequest = async(req,res)=>{
    const reqId = req.params.reqid;
    const studentId = req.user._id;
    await Student.findByIdAndUpdate(studentId,{$pull:{requests:reqId}});
    req.flash("success","Request removed!");
    res.redirect("/student/requests/received");
}

module.exports.requestReturn = async(req,res)=>{
    let bookId = req.params.bookid;
    let book = await Book.findById(bookId,{_id:0,isHold:1,isLentTo:1,title:1});
    if(book.isHold){
        req.flash("error","please cancel request in Requests received section");
        return res.redirect(`/student/mybooks/${bookId}`);
    }
    let reqTo = await Student.findById(book.isLentTo,{username:1,_id:0});
    let reqBy = await Student.findById(req.user._id,{username:1,_id:0});

    let request = new Request({
        requestBy:{
            name:reqBy.username,
            id:req.user._id,
        },
        requestFor:{
            title:book.title,
            id:bookId,
        },
        requestTo:{
            name:reqTo.username,
            id:book.isLentTo,
        },
        isReturnRequest:true,
    });
    await request.save();
    req.flash("success","book requested!");
    res.redirect(`/student/mybooks/${bookId}`);
}
const Student = require("../../model/student");
const Book = require("../../model/book");
const Lend = require("../../model/lend");

module.exports.showBorrowed = async(req,res)=>{
     const studentId = req.user._id;
    const student = await Student.findOne({_id:studentId},{borrowed:1,_id:0});
    res.render("students/book.ejs",{student});
}

module.exports.showBorrowedBook = async(req,res)=>{
    const bookId = req.params.bookid;
    let book = await Book.findById(bookId);
    let owner = await Student.findById(book.addedBy,{username:1,_id:0});
    let lendDoc = await Lend.findOne({_id:{$in:book.lendHistory},status:"borrowed"},{borrowDate:1,_id:0});
    res.render("students/borrow/show.ejs",{book,owner,lendDoc});
}

module.exports.returnBorrowedBook = async (req,res)=>{
    const bookId = req.params.bookid;
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
    req.flash("success","Book Returned");
    res.redirect("/student/borrowed");
}
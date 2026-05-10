const Book = require("../../model/book");
const Student = require("../../model/student");
const Request = require("../../model/request");
module.exports.findBooks = async (req,res)=>{
    const rawQ = req.query.q;
    const rawFil = req.query.fil;
    const page = parseInt(req.query.p) || 1;
    const limit = 10;
    const skip = (page-1)*limit;
    const filterMap = {
  tit: "title",
  sub: "subject",
  fac: "faculty",
  sem: "semester",
  aut: "author",
  cat: "category",
  isb: "isbn"
};
    let q = (rawQ && rawQ.trim()!=="")?rawQ:null; 
    let fil = (rawFil && rawFil.trim()!=="")?rawFil:null;
    fil = filterMap[fil];
    if(!q || !fil){
        req.flash("error","Please provide proper input")
        return res.redirect("/student");
    } 
    q = q.replace(/\s+/g, ' ');
    const studentId = req.user._id;
    const query = {
        addedBy:{$ne:studentId},
    [fil]: { $regex: q, $options: "i" } 
    }
    const bookCount = await Book.countDocuments(query);
    const totalPages = Math.ceil(bookCount/limit);
    const books = await Book.find(query,
        {title:1,status:1,isLent:1,isHold:1,isHeldBy:1,isLentTo:1}).sort({ createdAt: -1 }).skip(skip).limit(limit);
    res.render("students/search/result.ejs",{
        books,
        currentPage: page,
        totalPages,
        q,
        fil: rawFil});
};

module.exports.showBook = async(req,res)=>{
    const bookId = req.params.bookid;
    let book = await Book.findById(bookId);
    res.locals.isSearch = true;
    res.locals.prevUrl = req.get("referer");
    res.render("students/show.ejs",{book});
};

module.exports.borrowBook = async(req,res)=>{
       const prevUrl = req.body.prevUrl || "/student/requests";
    const bookId = req.params.bookid;
    const reqById = req.user._id;
    let book = await Book.findByIdAndUpdate(bookId,
        {isHold:true,status:"not_available",isHeldBy:reqById},
        {fields:{_id:0,addedBy:1,title:1}});
    const reqBy = await Student.findById(reqById,{name:1,_id:0});
    const reqToId = book.addedBy;
    const reqTo = await Student.findById(reqToId,{name:1,_id:0});
    let newRequest = new Request({
        requestBy:{
            name:reqBy.name,
            id:reqById,
        },
        requestFor:{
            title:book.title,
            id:bookId,
        },
        requestTo:{
            name:reqTo.name,
            id:reqToId,
        },
        isBorrowRequest:true,
    });
    await newRequest.save();
    req.flash("success","Book requested Successfully.");
    res.redirect(prevUrl);
}
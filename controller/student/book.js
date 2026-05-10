const Book = require("../../model/book");
const Student = require("../../model/student");
const Request = require("../../model/request");

module.exports.showAllBooks = async(req,res)=>{
    const studentId = req.user._id;
    const student = await Student.findOne({_id:studentId},{books:1,_id:0});
    res.render("students/book.ejs",{student});
};

module.exports.showBook = async(req,res)=>{
    const bookId = req.params.bookid;
    let book = await Book.findById(bookId);
    req.session.entries = book.lendHistory.length;
    res.locals.isSearch = false;
    let request = await Request.findOne({"requestFor.id":bookId,requestStatus:"requested"});
    res.locals.returnRequest = request?true:false;
    res.render("students/show.ejs",{book});
}

module.exports.showLendHistory = async(req,res)=>{
    const bookId = req.params.bookid;
    if(!req.session.entries){
        const data = await Book.findOne({_id:bookId},{lendHistory:1,_id:0});
        req.session.entries = data.lendHistory.length;
    }
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const book = await Book.findOne(
    { _id: bookId },
    { lendHistory: 1 }
  ).populate({
    path: "lendHistory",
    options: {
      sort: { borrowDate: -1 },
      skip: (page - 1) * limit,
      limit: limit
    }
  });
  if(book.lendHistory.length===0){
    req.flash("success","No Lending History Availble");
    return res.redirect(`/student/mybooks/${bookId}`);
  }
  const hasNextPage = (page*limit)<req.session.entries;
  res.render("students/history.ejs", {
    book,
    page,
    limit,
    hasNextPage: hasNextPage,
    hasPrevPage: page > 1
  });
};

module.exports.renderEditForm = async(req,res)=>{
    const bookId = req.params.bookid;
    let book = await Book.findById(bookId);
    res.render("students/edit.ejs",{book});
}

module.exports.editBook = async(req,res)=>{
    let bookId = req.params.bookid;
    let updatedData = req.body.book;
    await Book.findByIdAndUpdate(bookId,{$set:updatedData});
    req.flash("success","book edited successfully.");
    res.redirect(`/student/mybooks/${bookId}`);
}

module.exports.deleteBook = async (req,res)=>{
    let bookId = req.params.bookid;
    await Student.findByIdAndUpdate(req.user._id,{
      $pull:{books:
        {
          book_id:bookId
        }},
    });
    await Book.findByIdAndDelete(bookId);
    req.flash("success","Book deleted Successfully");
    res.redirect("/student/mybooks");
}
const Student = require("../../model/student");
const Book = require("../../model/book");

module.exports.renderProfile = async (req, res) => {
  const student = await Student.findById(req.user._id).select(
    "name roll email course createdAt"
  );
  res.render("students/general/profile", { student });
};

module.exports.renderChangePassForm = (req,res)=>{
  res.render("students/general/changePassword");
};


module.exports.changePass = async(req,res)=>{
      let {oldPassword,newPassword} = req.body;
      let student = await Student.findById(req.user._id);
      try{
      await student.changePassword(oldPassword,newPassword);
      await student.save();
      }catch(err){
        let msg = err.message;
         req.flash("error", msg);
    return res.redirect("/student/profile/change-password");
      }
       req.flash("success", "Password changed successfully");
    res.redirect("/student/profile");
};

module.exports.deleteUser = async(req,res,next)=>{
  let studentId = req.user._id;
  const student = await Student.findById(studentId,{books:1,_id:0});
  const books = student.books;
  for(let book of books){
    await Book.findByIdAndDelete(book.book_id);
  }
  await Student.findByIdAndDelete(studentId);
  req.logout((err)=>{
    if(err){
    return next(err);
    }
    req.flash("success","Account Deleted!");
    res.redirect("/home");
  });
};
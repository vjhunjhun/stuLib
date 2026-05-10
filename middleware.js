const ExpressError = require("./utils/ExpressError");
const { studentSchema, bookSchema } = require("./schema.js");
const Book = require("./model/book.js");
const Request = require("./model/request.js");
const Student = require("./model/student.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you must be logged-in");
    return res.redirect("/user/login");
  }
  next();
};

module.exports.isCollegeStudent = (req, res, next) => {
  const email = req.body.student.email ? req.body.student.email.toLowerCase() : "";
  if (email.endsWith("@pcampus.edu.np")) {
    return next();
  } else {
    req.flash("error", "Please use your college email");
    res.redirect("/home");
  }
}

module.exports.isSafeToDeleteUser = async (req, res, next) => {
  let student = await Student.findById(req.user._id).populate("books.book_id");
  if (student.requests.length !== 0) {
    req.flash("info", "please clear all the pending requests!");
    return res.redirect("/student/requests");
  }
  if (student.borrowed.length !== 0) {
    req.flash("info", "please return all the borrowed books!");
    return res.redirect("/student/borrowed");
  }
  let books = student.books;
  for (let book of books) {
    if (book.book_id.isLent) {
      req.flash(
        "info",
        "Your account has active loans. Please retrieve all lent books before deletion.",
      );
      return res.redirect(`/student/mybooks/${book.book_id._id}`);
    }
  }
  next();
};

module.exports.logOutUser = (req, res, next) => {
  if (req.user) {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
    });
  }
  next();
};

module.exports.isNewUser = async (req, res, next) => {
  let { username, email } = req.body.student;
  let student = await Student.findOne({
    $or: [{ username }, { email }],
  });
  if (student) {
    let msg;
    if (student.username === username && student.email === email) {
      msg = "given username and email";
    } else if (student.username === username) {
      msg = "given username";
    } else {
      msg = "given email";
    }
    req.flash("error", `A user with ${msg} already exists.`);
    return res.redirect("/user/signup");
  }
  next();
};

module.exports.isLent = async (req, res, next) => {
  let bookId = req.params.bookid;
  const bookStatus = await Book.findOne(
    { _id: bookId },
    { isLent: 1, isHold: 1, _id: 0 },
  );
  if (bookStatus.isLent || bookStatus.isHold) {
    return next();
  }

  req.flash("error", "Book is already with Owner!");
  res.redirect("/student");
};
module.exports.isNotRequested = async (req, res, next) => {
  let bookId = req.params.bookid;
  let request = await Request.findOne({
    "requestFor.id": bookId,
    requestStatus: "requested",
  });

  if (request) {
    req.flash("error", "Request already exists!");
    return res.redirect(`/student/mybooks/${bookId}`);
  }
  next();
};

module.exports.validatePasswordLength = (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (
    !oldPassword ||
    !newPassword ||
    oldPassword.length < 4 ||
    oldPassword.length > 15 ||
    newPassword.length < 4 ||
    newPassword.length > 15
  ) {
    req.flash("error", "Password must be 4–15 characters long.");
    return res.redirect("/student/profile/change-password");
  }

  next();
};

module.exports.isBookBorrower = async (req, res, next) => {
  let bookId = req.params.bookid;

  const student = await Student.findOne({
    _id: req.user._id,
    "borrowed.book_id": bookId,
  });

  if (student) {
    return next();
  }
  req.flash("error", "you are not authorized");
  res.redirect("/student");
};
module.exports.isNotLent = (owner = true) => {
  return async (req, res, next) => {
    let bookId = req.params.bookid;
    const prevUrl = req.query.prevUrl || "/student";
    const bookStatus = await Book.findOne(
      { _id: bookId },
      { isLent: 1, isHold: 1, _id: 0 },
    );
    if (bookStatus.isLent || bookStatus.isHold) {
      req.flash("error", "Book is lent/Hold by someone!");
      if (owner) {
        return res.redirect(`/student/mybooks/${bookId}`);
      } else {
        return res.redirect(prevUrl);
      }
    }
    next();
  };
};
module.exports.isAvailable = async (req, res, next) => {
  let bookId = req.params.bookid;
  const prevUrl = req.query.prevUrl || "/student";
  const book = await Book.findOne({ _id: bookId }, { status: 1, _id: 0 });
  if (book.status === "not_available") {
    req.flash("error", "Book is not available!");
    return res.redirect(prevUrl);
  }
  next();
};
module.exports.isReqReceiver = async (req, res, next) => {
  let reqId = req.params.reqid;
  let request = await Request.findById(reqId, { requestTo: 1, _id: 0 });
  let curUserId = req.user._id;
  if (!curUserId.equals(request.requestTo.id)) {
    req.flash("error", "You are not authorized!");
    return res.redirect("/student");
  }
  next();
};
module.exports.isReqSender = async (req, res, next) => {
  let reqId = req.params.reqid;
  let request = await Request.findById(reqId, { requestBy: 1, _id: 0 });
  let curUserId = req.user._id;
  if (!curUserId.equals(request.requestBy.id)) {
    req.flash("error", "You are not authorized!");
    return res.redirect("/student");
  }
  next();
};
module.exports.isValidReq = (requested = true) => {
  return async (req, res, next) => {
    let reqId = req.params.reqid;
    const request = await Request.findById(reqId);
    const status = request.requestStatus;
    if ((status === "requested") === requested) {
      return next();
    }
    req.flash("error", "Request couldn't be modified!");
    res.redirect("/student");
  };
};
module.exports.checkBookOwner = (shouldBeOwner = true) => {
  return async (req, res, next) => {
    let bookId = req.params.bookid;
    let reqUserId = req.user._id;
    const book = await Book.findOne({ _id: bookId }, { addedBy: 1, _id: 0 });
    const isOwner = book.addedBy.equals(reqUserId);
    if (shouldBeOwner && !isOwner) {
      req.flash("error", "You are not authorized!");
      return res.redirect("/student");
    }
    if (!shouldBeOwner && isOwner) {
      req.flash("error", "You are not authorized!");
      return res.redirect(`/student/mybooks/${bookId}`);
    }
    next();
  };
};

// module.exports.isBookOwner = async (req,res,next)=>{
//     // let bookId = req.params.bookid;
//     // let reqUserId = req.user._id;
//     // const book = await Book.findOne({_id:bookId},{addedBy:1,_id:0});
//     // if(!book.addedBy.equals(reqUserId)){
//     //     req.flash("error","you are not authorized!");
//     // return res.redirect("/student");
//     // }
//     // next();
//     next(err);
// }
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.validateStudent = (req, res, next) => {
  let { error } = studentSchema.validate(req.body);
  if (error) {
    let msg = error.details[0].message;
    req.flash("error", msg);
    return res.redirect("/user/signup");
  } else {
    next();
  }
};
module.exports.validateBook = (req, res, next) => {
  let { error } = bookSchema.validate(req.body);
  if (error) {
    console.log(error);
    throw new ExpressError(400, "books details incomplete or invalid");
  } else {
    next();
  }
};

module.exports.hasAddBook = (req, res, next) => {
  let books = req.user.books;
  if (!books.length) {
    req.flash("error", "You must add a book before searching");
    return res.redirect("/student");
  } else {
    next();
  }
};

module.exports.isAUser = async (req, res, next) => {
    let email = req.body.email;
    const student = await Student.findOne({ email: email }, { email: 1 });
    if (!student){
        req.flash("error", "No student exist with the given email");
        return res.redirect("/user/reset");
    } else {    
        next();
    }
};
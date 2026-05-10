const express = require("express");
const { isLoggedIn, validateBook, isNotLent, checkBookOwner } = require("../../middleware");
const wrapAsync = require("../../utils/wrapAsync");
const router = express.Router();
const studentBookController = require("../../controller/student/book.js");


router.get("/",isLoggedIn,wrapAsync(studentBookController.showAllBooks));
router.get("/:bookid",isLoggedIn,checkBookOwner(),wrapAsync(studentBookController.showBook));

router.get("/:bookid/info",isLoggedIn,checkBookOwner(),wrapAsync(studentBookController.showLendHistory));

router.get("/:bookid/edit",isLoggedIn,checkBookOwner(),isNotLent(),wrapAsync(studentBookController.renderEditForm));

router.patch("/:bookid/edit",isLoggedIn,checkBookOwner(),validateBook,isNotLent(),wrapAsync(studentBookController.editBook));

router.delete("/:bookid",isLoggedIn,checkBookOwner(),isNotLent(),wrapAsync(studentBookController.deleteBook));
module.exports = router;
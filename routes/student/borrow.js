const express = require("express");
const { isLoggedIn, checkBookOwner, isBookBorrower } = require("../../middleware");
const wrapAsync = require("../../utils/wrapAsync");
const router = express.Router();
const borrowedController = require("../../controller/student/borrow.js");
router.get("/",isLoggedIn,wrapAsync(borrowedController.showBorrowed));

router.get("/:bookid",isLoggedIn,checkBookOwner(false),isBookBorrower,wrapAsync(borrowedController.showBorrowedBook));

router.patch("/:bookid/return",isLoggedIn,isBookBorrower,wrapAsync(borrowedController.returnBorrowedBook));
module.exports = router;
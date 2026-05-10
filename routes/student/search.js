const express = require("express");
const { isLoggedIn, checkBookOwner, isNotLent, isAvailable, hasAddBook } = require("../../middleware");
const wrapAsync = require("../../utils/wrapAsync");
const router = express.Router();
const searchController = require("../../controller/student/search.js"); 

router.get("/",isLoggedIn,hasAddBook,wrapAsync(searchController.findBooks));


router.get("/:bookid",isLoggedIn,checkBookOwner(false),wrapAsync(searchController.showBook));


router.post("/borrow/:bookid",isLoggedIn,checkBookOwner(false),
isNotLent(false),
isAvailable,
wrapAsync(searchController.borrowBook));

module.exports = router;
const express = require("express");
const { isLoggedIn, validateBook } = require("../../middleware");
const wrapAsync = require("../../utils/wrapAsync");
const router = express.Router();
const generalController = require("../../controller/student/generalControl.js");
router.get("/",isLoggedIn,wrapAsync(generalController.renderIndexPage));
router.get("/addbook",isLoggedIn,generalController.renderAddBookPage);

router.post("/addbook",isLoggedIn,validateBook,wrapAsync(generalController.addBook));
module.exports = router;
const express = require("express");
const { isLoggedIn, validatePasswordLength, isSafeToDeleteUser } = require("../../middleware");
const wrapAsync = require("../../utils/wrapAsync");
const router = express.Router();
const profileController = require("../../controller/student/profile.js");
router.get("/", isLoggedIn, wrapAsync(profileController.renderProfile));

router.get("/change-password",isLoggedIn,profileController.renderChangePassForm);
router.patch("/change-password",isLoggedIn,validatePasswordLength,wrapAsync(profileController.changePass));

router.delete("/",isLoggedIn,isSafeToDeleteUser,wrapAsync(profileController.deleteUser));

module.exports = router;

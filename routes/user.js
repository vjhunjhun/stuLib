const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync");
const {saveRedirectUrl,validateStudent, isNewUser, isAUser, isCollegeStudent} = require("../middleware.js");
const userController = require("../controller/user/user.js");

router.get("/login",userController.renderLoginForm);

router.post("/login",
    saveRedirectUrl,
    passport.authenticate("local",{failureRedirect:"/user/login",failureFlash:true}),
    userController.proceedLogin
);

router.get("/signup", userController.renderSignUpForm);
router.get("/reset", userController.renderResetForm);
router.post("/reset",isAUser,wrapAsync(userController.resetUserPassword));
router.post("/signup",isCollegeStudent,validateStudent,isNewUser,wrapAsync(userController.signUpUser));
router.get("/verify-email/:token",wrapAsync(userController.verifyEmail));
router.get("/reset/verify-email/:token",userController.resetPassword);
router.get("/logout",userController.logoutUser);
// router.post("/delete",wrapAsync(userController.deleteUser));

module.exports = router;
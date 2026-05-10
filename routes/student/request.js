const express = require("express");
const wrapAsync = require("../../utils/wrapAsync");
const { isLoggedIn, checkBookOwner, isLent, isNotRequested, isValidReq, isReqReceiver, isReqSender } = require("../../middleware");
const router = express.Router();
const requestController = require("../../controller/student/request.js");
router.get("/",requestController.showRequestSection);
router.get("/sent",isLoggedIn,wrapAsync(requestController.showSentSection));
router.get("/received",isLoggedIn,wrapAsync(requestController.showReceivedSection));
router.post("/received/:reqid/accept",isLoggedIn,isReqReceiver,isValidReq(),wrapAsync(requestController.acceptReceivedRequest));
router.post("/received/:reqid/decline",isLoggedIn,isReqReceiver,isValidReq(),wrapAsync(requestController.declineReceivedRequest));
router.patch("/sent/:reqid/cancel",isLoggedIn,isReqSender,isValidReq(),wrapAsync(requestController.cancelSentRequest));
router.delete("/sent/:reqid",isLoggedIn,isReqSender,isValidReq(false),wrapAsync(requestController.removeSentRequest));
router.delete("/received/:reqid",isLoggedIn,isReqReceiver,isValidReq(false),wrapAsync(requestController.removeReceivedRequest));

router.post("/books/:bookid/return",isLoggedIn,checkBookOwner(),isLent,isNotRequested,wrapAsync(requestController.requestReturn));
module.exports = router;
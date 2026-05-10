const Student = require("../../model/student");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const SiteStat = require("../../model/siteStat");

const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS
    }
});
async function sendEmailVerification(email,token) {
    const url = `${process.env.BASE_URL}/user/verify-email/${token}`;

    await transporter.sendMail({
        to:email,
        subject:"Verify your stuLib account",
        html: `
      <h3>Welcome to StuLib</h3>
      <p>Click the link below to verify your email:</p>
      <a href="${url}">Verify Email</a>
    `
    });
}

async function sendResetVerification(email,token) {
    const url = `${process.env.BASE_URL}/user/reset/verify-email/${token}`;

    await transporter.sendMail({
        to:email,
        subject:"Verify your stuLib account",
        html: `
      <h3>Hello From StuLib</h3>
      <p>Click the link below to verify your email First:</p>
      <a href="${url}">Verify Email</a>
      <p>After verifying your email you will receive new password via email.</p>
    `
    });
}

async function sendNewPassword(email, password) {
    await transporter.sendMail({
    to: email,
    subject: "Your New Password",
    html: `
      <h3>Hello From StuLib</h3>
      <p>Here is your new password please login to your account and change the password!</p>
      <p>Your Password: <b>${password}</b></p>
    `,
  });
}

module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login.ejs");
};
module.exports.renderResetForm = (req, res) => {
  res.render("users/reset.ejs");
};
module.exports.proceedLogin = (req,res,next)=>{
        let redirectUrl = res.locals.redirectUrl || "/student";
    if (!req.user.isVerified) {
  return req.logout((err) => {
    if(err){
         return next(err);
    }
    req.flash("error", "Please verify your email before logging in.");
    return res.redirect("/user/login");
  });
}
req.flash("success", "Welcome back!");
res.redirect(redirectUrl);
}
module.exports.renderSignUpForm = (req,res)=>{
    res.render("users/signup.ejs");
}

module.exports.signUpUser = async (req,res,next)=>{
    try{
        const token = crypto.randomBytes(32).toString("hex");
        const { student } = req.body;
        if (student.roll.length == 0) {
            req.flash(
              "error",
              "Roll no. cannot be empty",
            );
            return res.redirect("/user/signup");
        }
        const newStudent = new Student({
            ...student,
            isVerified:false,
            emailToken:token,
            emailTokenExpires:new Date(Date.now() + 24*60*60*1000),
        });
        await Student.register(newStudent,student.password);
        try {
  await sendEmailVerification(student.email, token);
} catch(err) {
  await Student.findByIdAndDelete(newStudent._id);
  req.flash("error", "Error sending verification email. Please try again.");
  return res.redirect("/user/signup");
}
        req.flash("success","Signup successful! Please check your email to verify your account.");
        res.redirect("/user/login");
    }catch(e){
        if(e.code===11000){
            const field = Object.keys(e.keyPattern)[0];
            e.message=`A user with ${field} already exists`;
        }
        req.flash("error",e.message);
        res.redirect("/user/signup");
    }
};

module.exports.verifyEmail = async(req,res,next)=>{
     const { token } = req.params;
      const student = await Student.findOne({
    emailToken: token,
    emailTokenExpires: { $gt: Date.now() }
  });
  if (!student) {
    req.flash("error", "Verification link is invalid or expired");
    return res.redirect("/user/signup");
  }
    student.isVerified = true;
  student.emailToken = undefined;
  student.emailTokenExpires = undefined;
  await student.save();
  await SiteStat.findOneAndUpdate({},
      { $inc: { studentJoined: 1 } },
       {new:true} 
    );
  req.flash("success", "Email verified successfully. You can now login.");
  res.redirect("/user/login");
}

module.exports.logoutUser = (req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","logged-out success");
        res.redirect("/home");
    })
};

module.exports.resetUserPassword = async (req, res, next) => {
    try {
        const email = req.body.email;
        const student = await Student.findOne({ email: email });
        if (!student.isVerified) {
            req.flash("error", "Please verify your email first.");
            return res.redirect("/user/reset");
        }
        const token = crypto.randomBytes(32).toString("hex");
      student.emailToken = token;
      student.emailTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await student.save();
      try {
        await sendResetVerification(student.email, token);
      } catch (err) {
        req.flash(
          "error",
          "Error sending verification email. Please try again.",
        );
        return res.redirect("/user/reset");
        }
       req.flash(
         "success",
         "Please check your email to verify your account for password reset.",
       );
       res.redirect("/user/login"); 
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/user/reset");
    }
};

module.exports.resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const student = await Student.findOne({
            emailToken: token,
            emailTokenExpires: { $gt: Date.now() },
        });
        if (!student) {
            req.flash("error", "Verification link is invalid or expired");
            return res.redirect("/user/reset");
        }
        const generateNewPassword = crypto.randomBytes(4).toString("hex");
        const email = student.email;
        await student.setPassword(generateNewPassword);
        await student.save();
        await sendNewPassword(email, generateNewPassword);
        req.flash(
            "success",
            "A new password has been sent to your email address. Please log in and change it.",
        );
        res.redirect("/user/login");
    } catch (err) {
        req.flash("error", "There occured a error please reset the password again.")
        res.redirect("/user/reset");
    }
};


// module.exports.deleteUser = async(req,res)=>{
//     const id = req.user._id;
//     const deletedUser = await Student.findByIdAndDelete(id);
//     res.redirect("/home");
// }
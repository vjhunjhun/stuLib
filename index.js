if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
};

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port =process.env.PORT || 8080;


const path = require("path");
const ejsMate = require("ejs-mate");
app.engine("ejs",ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public")));
const methodOverride = require("method-override");
const Student = require("./model/student.js");
const SiteStat = require("./model/siteStat.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {logOutUser, isLoggedIn} = require("./middleware.js");
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));

const session = require("express-session");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const userRoute = require("./routes/user.js");
const studentRoute = require("./routes/student/genRoute.js");
const studentBookRoute = require("./routes/student/mybook.js");
const studentSearchRoute = require("./routes/student/search.js");
const studentBorrowRoute = require("./routes/student/borrow.js");
const studentRequestRoute = require("./routes/student/request.js");
const studentProfileRoute = require("./routes/student/profile.js");
const { join } = require('node:path');

const sessionOption = {
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge:7 * 24 * 60 * 60 * 1000,
        httpOnly:true,
    }
};
const sessionMiddleware = session(sessionOption);
app.use(sessionMiddleware);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(Student.authenticate()));
passport.serializeUser(Student.serializeUser());
passport.deserializeUser(Student.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.info = req.flash("info");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    res.locals.currentPath = req.path; 
    next();
});

main().then(()=>{
    console.log("connected to db");
    Student.startCleanup();
}).catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(process.env.MONGO_URI);
}

app.get("/home",logOutUser,wrapAsync(async (req,res)=>{
    let stats = await SiteStat.findOne();
    // if(!stats){
    //      stats = await SiteStat.create({
    //         studentJoined: 0,
    //         bookShared: 0,
    //         totalBooks:0
    //     });
    // }
    if(!req.user){
        res.locals.currUser="";
    }
    res.render("users/home.ejs",{stats});
}));

app.get("/about", (req,res)=>{
    res.render("users/aboutUs.ejs");
});

app.get("/features", (req,res)=>{
    res.render("users/features.ejs");
});

app.get("/contact", (req,res)=>{
    res.render("users/contactUs.ejs");
});

app.get("/faq", (req,res)=>{
    res.render("users/faq.ejs");
});

app.get("/privacy", (req,res)=>{
    res.render("users/privacy.ejs");
});

app.get("/terms", (req,res)=>{
    res.render("users/terms.ejs");
});

app.use("/user",userRoute);
app.use("/student/mybooks",studentBookRoute);
app.use("/student/search",studentSearchRoute);
app.use("/student/borrowed",studentBorrowRoute);
app.use("/student/requests",studentRequestRoute);
app.use("/student/profile",studentProfileRoute);
app.use("/student",studentRoute);
app.get("/student/chat", (req, res) => {
   res.sendFile(join(__dirname, 'index.html'));
});

app.all("{*splat}",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
});
app.use((err,req,res,next)=>{
    let {status=500,message="error not classified"} = err;
    res.status(status).render("users/error.ejs",{message});
});

app.listen(port, () => {
    console.log(`app listening on port ${port}`);
})

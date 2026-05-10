const Book = require("../../model/book");
const Student = require("../../model/student");

module.exports.renderIndexPage = async(req,res)=>{
    const name = req.user.username;
    const student = await Student.aggregate([{$match:{_id:req.user._id}},
        {$project:{
            _id:0,
            requestCount:{$size:"$requests"}
        }}
    ]);
    let reqCount = student[0]?.requestCount || 0;
    const hour = new Date().getHours();
    let greeting;
    if (hour >= 5 && hour < 12) {
        greeting = "Good Morning";
    } else if (hour >= 12 && hour < 17) {
        greeting = "Good Afternoon";
    } else {
        greeting = "Good Evening";
    }
    res.render("students/index.ejs",{name,greeting,reqCount});
};

module.exports.renderAddBookPage = (req,res)=>{
    res.render("students/new.ejs");
}

module.exports.addBook = async (req,res)=>{
        const newBook = new Book({...req.body.book,addedBy:req.user._id});
        await newBook.save();
        req.flash("success","Book added successfully");
        res.redirect("/student");
}
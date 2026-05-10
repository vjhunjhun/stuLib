const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Student = require("../model/student.js");
const siteStat = require("../model/siteStat.js");
const Lend = require("../model/lend.js");
const bookSchema = new Schema({
      title: {
         type: String,
         required: true
       },
        subject: {
         type: String,
         required: true
       },
       status: {
          type: String,
  enum: ["available","not_available"],
  required: true,
  lowercase: true,
  trim: true
       },
       faculty:String,
       semester:Number,
       author: {
         type: String,
         required: true
       },
       isbn: String,
       category: String,
       addedBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Student",
       },
       createdAt: {
         type: Date,
         default: Date.now
       },
       lendHistory: [
  {
    type: Schema.Types.ObjectId,
    ref: "Lend"
  },
],
description:String,
isLent:{
  type:Boolean,
  default:false,
},
isHold:{
  type:Boolean,
  default:false,
},
isLentTo:{
  type:Schema.Types.ObjectId,
  ref:"Student",
},
isHeldBy:{
  type:Schema.Types.ObjectId,
  ref:"Student",
}
});
bookSchema.post("save",async(data)=>{
  await siteStat.findOneAndUpdate({},
    {$inc:{totalBooks:1}}
  );
  const userId =  data.addedBy;
  const bookId = data._id;
  await Student.findByIdAndUpdate(userId,
    {$push:{books:{
      title:data.title,
      book_id:bookId
    }}}
  );
}); 

bookSchema.post("findOneAndDelete",async(data)=>{
  if (!data) {
    return;
  }
  const lends = data.lendHistory || [];
 await Lend.deleteMany({
  _id: { $in: lends }
});
  await siteStat.findOneAndUpdate({},
    {$inc:{totalBooks:-1}}
  );
}); 
const Book = mongoose.model("Book",bookSchema);
module.exports = Book;
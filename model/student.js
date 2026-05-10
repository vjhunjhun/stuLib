const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
const SiteStat = require("./siteStat.js"); 
const studentSchema = new Schema({
     name: {
    type: String,
    required: true,
  },
  roll: {
    type: String,
    required: false,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  course: {
    type:String,
    required:false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  borrowed:[{
    _id: false,
    title:String,
    book_id:{
    type:Schema.Types.ObjectId,
    ref:"Book",
  }},],
  books:[{
    _id: false,
    title:String,
    book_id:{
    type:Schema.Types.ObjectId,
    ref:"Book",
  }},],
  requests:[{
    type:Schema.Types.ObjectId,
    ref:"Request",
  },],
  isVerified: {
  type: Boolean,
  default: false
},
emailToken: String,
  emailTokenExpires: Date,
});
studentSchema.plugin(passportLocalMongoose);
studentSchema.post("findOneAndDelete",async(deletedStudent)=>{
  await SiteStat.findOneAndUpdate({},
    {$inc:{studentJoined:-1}},
    {new:true}
  );
});


const Student = mongoose.model("Student",studentSchema);
module.exports = Student;

const cleanUpInterval = 60*60*1000;
let deleteUnverifiedUser = async()=>{
  const now = new Date();
  try{
    const unverifiedStudents = await Student.find({
            isVerified:false,
            emailTokenExpires:{$lt:now},
        });

        if(unverifiedStudents.length == 0){
            return;
        }
        const result = await Student.deleteMany({
          _id:{$in:unverifiedStudents.map(r=>r._id)}
        });
        console.log(`Deleted ${result.deletedCount} unverified Students.`);
  }catch(err){
        console.error("error cleaning old messages",err);
    }
};

Student.startCleanup = () => {
  deleteUnverifiedUser();
  setInterval(deleteUnverifiedUser, cleanUpInterval);
};
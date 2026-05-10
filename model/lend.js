const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const lendSchema = new Schema({
       lendBy: {
        _id:false,
        username:{
          type:String,
          required:true,
        },
         lend_id:{
          type: mongoose.Schema.Types.ObjectId,
         ref: "Student",
         required: true
         }
       },
       borrowDate: {
         type: Date,
         default: Date.now
       },
       returnDate: Date,
       status: {
         type: String,
         enum: ["borrowed", "returned"],
         default: "borrowed"
       }
});
const Lend = mongoose.model("Lend",lendSchema);
module.exports = Lend;
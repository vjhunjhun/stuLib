const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const statSchema = new Schema({
     studentJoined:{
        type:Number,
        default: 0,
        min:0
    },
    bookShared:{
        type:Number,
        default: 0,
        min:0
    },
    totalBooks:{
        type:Number,
        default: 0,
        min:0
    }
});
const SiteStat = mongoose.model("SiteStat",statSchema);
module.exports = SiteStat;
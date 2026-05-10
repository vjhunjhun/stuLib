const mongoose = require("mongoose");
const Student = require("../model/student.js");
const Schema = mongoose.Schema;

const requestSchema = new Schema({
    requestBy: {
        name: {
            type: String,
            required: true
        },
        id: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: true
        }
    },

    requestFor: {
        title: {
            type: String,
            required: true
        },
        id: {
            type: Schema.Types.ObjectId,
            ref: "Book",
            required: true
        }
    },

    requestTo: {
        name: {
            type: String,
            required: true
        },
        id: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: true
        }
    },
    requestStatus:{
        type:String,
        default:"requested",
        enum:["requested","accepted","declined","cancelled"],
    },
    isBorrowRequest: {
        type: Boolean,
        default: false
    },
    isReturnRequest: {
        type: Boolean,
        default: false
    },

    createdOn: {
        type: Date,
        default: Date.now
    },

    acceptedOn: Date,
    declinedOn: Date,
    cancelledOn:Date,
});

requestSchema.post("save",async (data)=>{
    const reqById = data.requestBy.id;
    const reqToId = data.requestTo.id;
    await Student.findByIdAndUpdate(reqById,{$push:{requests:data._id}});
    await Student.findByIdAndUpdate(reqToId,{$push:{requests:data._id}});
});

const Request = mongoose.model("Request",requestSchema);
module.exports = Request;

const cleanUpInterval = 60*60*1000;

let cleanUpExpiredRequests = async ()=>{
    const cutOffDate = new Date(Date.now()-12*60*60*1000);
    try{
        const expiredRequests = await Request.find({
            requestStatus:{$ne:"requested"},
            createdOn:{$lt:cutOffDate},
        });

        if(expiredRequests.length == 0){
            return;
        }
            for(let request of expiredRequests){
                const senderId = request.requestBy.id;
                const receiverId = request.requestTo.id;
                await Student.updateOne(
                    {_id:senderId},
                    { $pull: { requests: request._id } },
                );
                 await Student.updateOne(
                    {_id:receiverId},
                    { $pull: { requests: request._id } },
                );
            }
             const result = await Request.deleteMany({
                _id:{$in:expiredRequests.map(r=>r._id)}
             });
              console.log(`Deleted ${result.deletedCount} expired requests`);
    }catch(err){
        console.error("error cleaning old messages",err);
    }
};

cleanUpExpiredRequests();


setInterval(cleanUpExpiredRequests, cleanUpInterval);
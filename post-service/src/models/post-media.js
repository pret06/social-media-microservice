const mongoose = require('mongoose')

const postMediaSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.ObjectId,
        ref : "User",
        required : true
    },
    content :{
        type : String,
        required : true
    },
    mediaIds :{
        type : String
    },
    createdAt :{
        type : Date,
        default : Date.now()
    }
}, {
    timestamps : true
})

module.exports = ("Post", postMediaSchema)


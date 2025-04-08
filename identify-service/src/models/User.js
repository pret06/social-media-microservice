const mongoose = require('mongoose')
const argon2 = require('argon2')

const userScheama = new mongoose.Schema({
    username : {
        type : String,
        unique : true,
        required : true,
        trim : true
    },
    email : {
        type : String,
        unique : true,
        required : true,
        trim : true,
        lowercase : true
    },
    password : {
        type : String,
        required : true
    },
    role :{
        type : Number,
        enum : [0 , 1],  // 0 is for admin and 1 is for user
        required : true,
        default : 1
    },
    createdAt :{
        type : Date,
        default : Date.now
    },
}, {timestamps : true})

// Hashed the password before saving
userScheama.pre("save" , async function (next) {
    if(this.isModified('password')){
        try {
            // this.isModified will check if the password is changed or raw if yes then we will hash the password
            this.password = await argon2.hash(this.password)
        } catch (error) {
            return next(error)
        }
    } 
})

// If password got hashed now we will verify and compare it
userScheama.methods.comparePassword = async function (userPassword){
    try {
        return await argon2.verify(this.password , (userPassword))
    } catch (error) {
        throw error
    }
}


userScheama.index({username : "text"})     // So this is basically for searching in the feild at the top of the username

module.exports = ("User" , userScheama)

const RefreshTokens = require('../models/RefreshToken')
const User = require('../models/User')
const genrateTokens = require('../utils/generateToken')
const generateToken = require('../utils/generateToken')
const logger = require('../utils/logger')
const {validLogin,validationRegistration} = require('../utils/validation')

// user Registration
const userRegistration = async(req,res)=>{
    logger.info("User is hitting registartion endpoint !")
    try {
        const {error} = validationRegistration(req.body)
        if(error){
            logger.warn("validation error" , error.details[0].message)
            res.status(404).json({
                success : false,
                message : error.details[0].message
            })
        }

        const {email , username , password} = req.body
        let user = await User.findOne({ $or : [{email}, {username}] })
        if(user){
            logger.warn("user already exists")
            return res.status(402).json({
                success : false,
                message : "user already exists!"
            })
        }

        user = new User({email, password , username})
        await user.save()
        logger.warn("user saved SuccessFully")

        const {accessToken , refreshtoken} = await genrateTokens(user)
        res.status(201).json({
            success: true,
            message: "User registered successfully!",
            accessToken,
            refreshtoken,
          });
    
    } catch (e) {
    logger.error("Registration error occured", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    }
}

// Login User
const loginUser = async(req,res)=>{
    logger.info("user hits logging endpoint !")
    try {
        const {error} = validLogin(req.body)
        if(error){
            logger.warn("Loggedin failed!" , error.details[0].message)
            return res.status(404).json({
                succes : false,
                message : error.details[0].message
            })
        }
        const {email ,password } = req.body
        let user = await User.findOne({email})
        if(!user){
            logger.warn("Invalid user")
            return res.status(404).json({
                success : false,
                message : "Invalid credentials"
            })
        }
        const isValidPassword = await user.comparePassword(password)
        if(!isValidPassword){
            logger.warn("incorrect password")
            return res.status(404).json({
                success : false,
                message : "Password is Incorrect!"
            })
        }
        const {accessToken,refreshtoken} = generateToken(user)
        res.status(402).json({
            accessToken,
            refreshtoken,
            userId : user._id
        })
    } catch (e) {
        logger.error("Registration error occured", e);
        res.status(500).json({
        success: false,
        message: "Internal server error",
        });
    }
}

// Refresh Token
const refresftokenUser = async(req,res)=>{
    logger.info("Refresh token endpoint hit !")
    try {
        const {refreshToken} = req.body
        if(!refreshToken){
            logger.warn("Refreshtoken is invalid!")
            res.status(400).json({
                succes : false,
                message : "Refreshtoken is invalid"
            })
        }
        
        const storedToken = await RefreshTokens.findOne({ token : refreshToken })
        
        if(!storedToken){
            logger.warn("Invalid token enter")
            return res.status(400).json({
                success : false,
                message : "Invalid token entered"
            }) 
        }

        if(!storedToken || storedToken.expiresAt < new Date()){
            logger.warn("Token expired")
            return res.status(404).json({
                succes : false,
                message : "Token is Expired!"
            })
        }

        const user = await User.findById(storedToken.user)
        if(!user){
            logger.warn("User not found")
            return res.status(400).json({
                success : false,
                message : "User not Found"
            })
        }

        const {accessToken : newaccessToken, refreshToken : newrefreshToken} = await generateToken(user)

        // Token is valid and not expired, delete it to prevent reuse 
        await RefreshTokens.deleteOne({ _id : storedToken._id })

        res.json({
            accessToken : newaccessToken,
            refreshToken : newrefreshToken
        })
    } catch (e) {
        logger.error("Refresh token is invalid !", e);
        res.status(500).json({
        success: false,
        message: "Internal server error",
        });
    }
}

// Logout User
const logoutUser = async(req,res)=>{
    logger.info("Logout endpoint hits")
    try {
        const {refreshToken} = req.body
        if(!refreshToken){
            logger.warn("Token is missing")
            return res.status(404).json({
                success : false,
                message : "Token is missing"
            })
        }

        const storedToken = await RefreshTokens.findOneAndDelete({
            token : refreshToken
        })
        if(!storedToken){
            logger.warn("Invalid token provided")
            return res.status(400).json({
                success : false,
                message : "Invalid token provided"
            })
        }
        logger.info("User Logout / token expired")

        res.json({
            success : true,
            message : "Logout Scccessfully!"
        })
    } catch (e) {
        logger.error("Refresh token is expired !", e);
        res.status(500).json({
        success: false,
        message: "Internal server error",
        });
    }
}

module.exports = {
    userRegistration,
    loginUser,
    refresftokenUser,
    logoutUser
}
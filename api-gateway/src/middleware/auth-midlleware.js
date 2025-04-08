const jwt = require('jsonwebtoken')
const logger = require('../utils/logger')

const validatetoken = async(req,res,next) =>{
    const authheader = req.headers("authorization") || req.headers.authorization
    const token = authheader && authheader.split(" ")[1]

    if(!token){
        logger.warn("Acess token is not provided")
        return res.status(401).json({
            success : false,
            message : "Access token required !"
        })
    }

    jwt.verify(token , process.env.JWT_SECRET_KEY , (err,user)=>{
        if(err){
            logger.warn("Invalid token provided")
            return res.status(403).json({
                success : false,
                message : "Invalid token !"
            })
        }
        req.user = user
        next()
    })
}

module.exports = { validatetoken }
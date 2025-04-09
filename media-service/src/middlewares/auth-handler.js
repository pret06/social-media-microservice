const logger = require('../utils/logger')

const authenticateUser = (req,res,next) =>{
    const userId = req.headers("x-user-id")

    if(!userId){
       logger.warn("Access denied user not authenticcated" , userId)
       return res.status(400).json({
        success : false ,
        message : "Access denied to the user"
       })
    }
    req.user = user
    next()
}

module.exports = { authenticateUser }
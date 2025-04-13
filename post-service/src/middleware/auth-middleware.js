const logger = require('../utils/logger')

const authenticateuser = (req,res,next) =>{
    const userId = req.headers['x-user-id']

    if(!userId){
        logger.error("Authentication failed as userId not provided !", error.details[0].message)
        return res.status(404).json({
            success : false,
            message : "Authentication failed !" || error.details[0].message
        })
    }

    req.user = {userId}
    next()
}

module.exports = { authenticateuser }

const logger = require('../utils/logger')

const errorHandler = (err,req,res,next) =>{
    logger.error(err.satck)

    res.status(err.status || 500).json({
        success : false,
        message : err.message || "Something Went Wrong !"
    })
}

module.exports = errorHandler
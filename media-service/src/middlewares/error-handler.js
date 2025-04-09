const logger = require('../utils/logger')

const errorhandler = (err, req,res,next) =>{
    logger.error(err.stack)

    res.status(err.status || 500).json({
        success : false,
        message : err.message || "Internal Server error"
    })
}

module.exports = errorhandler
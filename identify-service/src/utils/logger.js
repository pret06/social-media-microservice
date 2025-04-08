const winston = require ("winston")

const logger = winston.createLogger({
    level : process.env.NODE_ENV === "production" ? "info" : "debug", // If it is in production it will log only error , warning and when it is in dev it will log debug
    format : winston.format.combine(
        winston.format.timestamp(),
        winston.format.splat(),
        winston.format.errors({ stack : true }),
        winston.format.json()
    ),
    defaultMeta : {service : "identity-service"},
    transports : [
        new winston.transports.Console({
            format : winston.format.combine(
                winston.format.colorize(),     // Adds color to logs based on level 
                winston.format.simple()     // Just message and level
            ),

        }),
        new winston.transports.File({
            filename : "error.log",
            level : "error"
        }),

        new winston.transports.File({
            filename : "combined.log"
        })
    ]
        
})

module.exports = logger
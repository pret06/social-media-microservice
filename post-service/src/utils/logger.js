const winston = require('winston')

const logger = winston.createLogger({
    level : process.env.NODE_ENV === "Production" ? "Info" : "debug",
    format : winston.format.combine(
        winston.format.splat(),
        winston.format.timestamp(),
        winston.format.errors({ stack : true }),
        winston.format.json()  
    ),
    defaultMeta : {services : "Post-Media"},
    transports : [
        new winston.transports.Console({
            format : winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({filename : "error.log" , level : "error"}),
        new winston.transports.File({filename : "combined.log"})

    ]
})

module.exports = logger
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const postRoutes = require('./route/post-media-route')
const errorHandler = require('./middlewares/error-handler')
const mongoose = require('mongoose')
const redis = require('ioredis')
const logger = require('./utils/logger')
const { RateLimiterRedis } = require('rate-limiter-flexible');
const {connectionToRabbitMQ} = require('./utils/rabbitMQ')

const app = express()
const PORT = process.env.PORT || 3003

const redisClient = new redis(process.env.REDIS_URL)

mongoose.connect(process.env.MONGO_DB_URI).then(()=>{
logger.info('Mongoose connected !')
}).catch((e)=>{
logger.error('Unable to connect')
})

app.use(helmet())
app.use(cors())
app.use(express.json())

app.use((req, res , next)=>{
    logger.info(`Recieived the request ${req.method} to Url ${req.url}`)
    logger.info(`Request body data : ${req.body}`)
    next()
})

const rateLimiter = new RateLimiterRedis({
    storeClient : redisClient,
    keyPrefix : "middleware",
    points : 10, // 10 req per second
    duration : 1

})

app.use((req,res,next)=>{
    rateLimiter.consume(req.ip)
    .then(()=> next())
    .catch((e)=>{
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({ success: false, message: "Too many requests" });
    })
})

app.use('/api/posts', 
    (req,res,next)=>{
        req.redisClient = redisClient
        next()
    },
    postRoutes
)


app.use(errorHandler)

async function startServer() {
    try {
        await connectionToRabbitMQ()
        app.listen(PORT , (req,res)=>{
         logger.info(`Port is werking fine on Server with Port no : ${PORT} and with method ${req.method}`)
        })
    } catch (error) {
        logger.error("Unable to connect to the server", error)
    }
}

startServer()

 // Unhandled Promise Rejection
 process.on("unhandledRejection", (reason,Promise)=>{
    logger.info(`Received the unhandled rejection at ${Promise} at ${reason}`)
 })



require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const helmet = require('helmet')
const cors = require('cors')
const logger = require('./utils/logger')
const redis = require('ioredis')
const { RateLimiterRedis } = require('rate-limiter-flexible');
const { rateLimit } = require('express-rate-limit')
const { RedisStore } = require("rate-limit-redis")
const {route} = require('./route/identity-service')
const errorHandler = require('./middleware/errorhandler')

mongoose.connect(process.env.MongoDB_URL)
.then(()=>{logger.info("Mongo Db connection Succesfull !")})
.catch((e)=>{logger.error("Mongo connection error", e)})

const redisClient = new redis(process.env.REDIS_URL)

//  Middlewars
app.use(helmet())
app.use(cors())
app.use(express.json())

app.use((req,res,next)=>{
    logger.info(`Recieved ${req.method} request to ${req.url} `)
    logger.info(`Request body ${req.body}`)
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

const windowOpenForRequests = new rateLimit({
    windowMs : 15 * 60 * 1000,
    max : 50,
    standardHeaders : true,
    legacyHeaders : false,
    handler : (req,res)=>{
        logger.warn(`Too many request hitted with in mentioned timeline at IP : ${req.ip}`)
        res.status(429).json({ success: false, message: "Too many requests" });
    },
    store : new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
      }),
})

// Api auth for register Routes
app.use('/api/auth/register' , windowOpenForRequests)

// Routes
app.use('/api/auth' , route)

// Error handler
app.use(errorHandler())


app.listen(process.env.PORT , (req,res)=>{
    logger.info(`Server is listening on ${PORT}`)
})


// Unhandled promise Rejection
process.on("unhandledRejection" , (reason, promise)=>{
    logger.error("Unhandled Rejection at", promise, "reason:", reason)
})




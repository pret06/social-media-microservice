require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const helmet = require('helmet')
const { rateLimit } = require('express-rate-limit')
const { RedisStore } = require('rate-limit-redis')
const logger = require('./utils/logger')
const { validatetoken } = require('./middleware/auth-midlleware')
const errorhandler = require('./middleware/error-handler')
const proxy = require('express-http-proxy')

const PORT = process.env.PORT

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

const windowOpenForRequests =  rateLimit({
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

app.use(windowOpenForRequests)

const proxyOption = {
    proxyReqPathResolver : (req)=>{                             // Will replace the incoming req before hitting to the proxy
        return req.originalURL.replace(/^\/v1/, "/api")
    },
    proxyErrorhandler : (error)=>{
        logger.error(`Proxy error : ${error.message}`)
        return res.status(500).json({
            success : false,
            message : error.message
        })
    }
}

app.use('/v1/auth', proxy(process.env.IDENTITY_SERVICE_URL , {
    ...proxyOption,
    proxyReqOptDecorator : (proxyReqOpts , srcreq) => {                  //Proxy request option in postman and source request
        proxyReqOpts.headers("content-Type") = "application/json"
        return proxyReqOpts
    },
    userResDecorator : (proxyres, proxyresData , userReq, userRes)=> {
        logger.info(`Recieved a resposnse from Identitiy Service : ${proxyres.statusCode}`)
        return proxyresData
    }

}))

//setting up proxy for our post service

app.use(
  "/v1/posts",
  validatetoken,
  proxy(process.env.POST_SERVICE_URL, {
    ...proxyOption,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;

      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from Post service: ${proxyRes.statusCode}`
      );

      return proxyResData;
    },
  })
);

//setting up proxy for our media service
app.use(
    "/v1/media",
    validatetoken,
    proxy(process.env.MEDIA_SERVICE_URL, {
      ...proxyOption,
      proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
        if (!srcReq.headers["content-type"].startsWith("multipart/form-data")) {
          proxyReqOpts.headers["Content-Type"] = "application/json";
        }
  
        return proxyReqOpts;
      },
      userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(
          `Response received from media service: ${proxyRes.statusCode}`
        );
  
        return proxyResData;
      },
      parseReqBody: false,
    })
  );
  
  //setting up proxy for our search service
  app.use(
    "/v1/search",
    validatetoken,
    proxy(process.env.SEARCH_SERVICE_URL, {
      ...proxyOption,
      proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers["Content-Type"] = "application/json";
        proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
  
        return proxyReqOpts;
      },
      userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(
          `Response received from Search service: ${proxyRes.statusCode}`
        );
  
        return proxyResData;
      },
    })
  );
  
  app.use(errorhandler);
  
  app.listen(PORT, () => {
    logger.info(`API Gateway is running on port ${PORT}`);
    logger.info(
      `Identity service is running on port ${process.env.IDENTITY_SERVICE_URL}`
    );
    logger.info(
      `Post service is running on port ${process.env.POST_SERVICE_URL}`
    );
    logger.info(
      `Media service is running on port ${process.env.MEDIA_SERVICE_URL}`
    );
    logger.info(
      `Search service is running on port ${process.env.SEARCH_SERVICE_URL}`
    );
    logger.info(`Redis Url ${process.env.REDIS_URL}`);
  });

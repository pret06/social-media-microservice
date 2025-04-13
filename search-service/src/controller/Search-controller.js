const logger = require('../utils/logger')
const Search = require('../model/Search')

const searchController = async(req,res)=>{

    const { query } = query

    try {
        // Search query direct from redis
        const cachedRsults = await req.redisClient.get(`Search:${query}`)
        if(cachedRsults){
            logger.info('Serving result from cache')
            return res.status(200).json(JSON.parse(cachedRsults))
        }

        // Search Result in Mongo DB
        const result = await Search.find(
            {
            $text : { $search : query }
           },
           {
            score : { $meta : "textScore"}
           }
        )
        .sort({score : { $meta : "textScore"}})
        .limit(10)

       // Save to Redis cache for 5 minutes (300 seconds)
       await req.redisClient.set(`Search : ${query}` , 300 , JSON.stringify(result))
       res.json(result)
    } catch (e) {
        logger.error("Error while searching post", e);
        res.status(500).json({
        success: false,
        message: "Error while searching post",
        });
    }
}

module.exports = { searchController }
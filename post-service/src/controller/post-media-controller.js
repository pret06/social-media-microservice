const Post = require('../models/post-media')
const logger = require('../utils/logger')
const { validateCreatepost } = require('../utils/validation')
const { publishEvent }  = require('../utils/rabbitMQ')
const { json } = require('express')

/**
 * @param {import("express").Request & { redisClient: any }} req
 */

async function invalidatePostCache(req, input ) {   // Two term will be there one is cachedkey and second is key we need to delete the cache memory
    const cachedkey = `post:${input}`               // it will fetch post like ex : post : 123 
    await req.redisClient.del(cachedkey)

    const keys = await req.redisClient.keys("post:*")   // And it will find all the posts
    if(keys.length > 0){
        await req.redisClient.del(keys)
    }
}

async function createPost (req,res) {
    logger.info('Create post end point hited !')
    try {
        const {error} = validateCreatepost(req.body)
        if(error){
            logger.error('validation error' , error.details[0].message)
            return res.status(404).json({
                success : false,
                message : error.details[0].message || "Some error occured during posting !"
            })
        }

        const { content , mediaIds } = validateCreatepost(req.body)

        const newlyCreatedPost = new Post({
            user : req.user.userId,
            content,
            mediaIds : mediaIds || []
        })

        await newlyCreatedPost.save()

        await publishEvent('post.created' , {
            postId : newlyCreatedPost._id.toString(),
            userId : newlyCreatedPost.user.toString(),
            content : newlyCreatedPost.content,
            createdAt : newlyCreatedPost.createdAt()
        })

        await invalidatePostCache(req ,newlyCreatedPost._id.toString())

        logger.info('Post created successfully' , newlyCreatedPost)
        return res.status(200).json({
            sucess : true,
            message : "Post created !",
            postdata : {
                newlyCreatedPost
            }
        })
    } catch (error) {
        logger.error('Something went wrong !')
        return res.status(500).json({
            success : false,
            message : "Something went wrong"
        })
    }
}

async function getAllposts (req,res) {
try {
    const page = parseInt(req?.query?.page)
    const limit = parseInt(req?.query?.limit)
    const startIndex = (page - 1) * limit

    const cachedkey = `post: ${page} : ${limit}`
    const cacheposts = await req.redisClient.get(cachedkey)
    if(cachedkey){
        return res.json(JSON.parse(cacheposts))
    }

    const post = await Post.find({})        // Find all the posts in the MongoDB collection
    .sort(createdAt - 1)    // Sorts the posts in descending order of creation (latest posts show first).
    .skip(startIndex)      //Skips a certain number of posts depending on the page you're on.
    .limit(limit)         //Limits how many posts you get per page (e.g., 10 posts).

    const toatalNoOfPost = await Post.countDocumets()

    const results = {
        post,
        current_page : page,
        total_no_of_posts : toatalNoOfPost,
        totalPages : Math.ceil(toatalNoOfPost / limit)
    }

    await req.redisClient.set(cachedkey, 300, JSON.stringify(results))
    res.JSON(results)
} catch (error) {
    logger.error('Something went wrong !')
        return res.status(500).json({
            success : false,
            message : "Something went wrong"
        })
}
}

async function getpost (req,res) {
    try {
        const postId = req.params.id
        const cachedkey = `post : ${postId}`
        const cachepost = await redisClient.get(cachedkey)
    
        if(cachedkey){
            return res.status(200).json(JSON.parse(cachepost))
        }
    
        const singlePostDetailsById = await Post.findById(postId)
    
        if(!singlePostDetailsById){
            logger.error('There is no post to this Id!')
            return res.status(400).json({
                success : false,
                message : error.details[0].message
            })
        }
    
        await req.redisClient.set(
            cachedkey,
            300,
            JSON.stringify(singlePostDetailsById)
        )
    
        res.json(singlePostDetailsById)

    } catch (error) {
        logger.error('Something went wrong !')
        return res.status(500).json({
            success : false,
            message : "Something went wrong"
        })
    }
}

async function deletepost(req,rs) {
    try {
       const post =  await Post.findOneAndDelete({
            _id : req.params.postId,
            user : req.user.userId
        })

       if(!post){
        logger.error("post not found")
        return res.status(404).json({
            success : false,
            message : "post not found"
        })
       }

       await publishEvent("post.deleted" , {
        postId : post._id.toString(),
        userId : post.user,
        mediaIds : post.mediaIds
       })

       await invalidatePostCache(req , req.params.id)
       res.json({
        success : true,
        message : "post deleted SuccessFully!"
       })
    } catch (error) {
        logger.error('Something went wrong !')
        return res.status(500).json({
            success : false,
            message : "Something went wrong"
        })
    }
}

module.exports = {
    invalidatePostCache,
    createPost,
    getAllposts,
    getpost,
    deletepost
}
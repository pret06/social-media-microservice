const Search = require('../model/Search')
const logger = require('../utils/logger')

async function handlePostCreated (event){
    try {
        const newSearchPost = new Search({
            postId : event.postId,
            userId : event.userId,
            content : event.content,
            createdAt : event.createdAt
        })
        await newSearchPost.save()

        logger.info(`Search post created : ${event.postId} , ${newSearchPost._id.toString()}`)
    } catch (error) {
        logger.error('Error occured during search post..!')
    }
}

async function handlePostdeleted (event){
try {
    await Search.findByIdAndDelete({ postId : event.postId })
    logger.info(`Post deleted with postId : ${event.postId}`)
} catch (error) {
    logger.error('Error occured during search post..!')
}
}

module.exports = { handlePostCreated , handlePostdeleted }
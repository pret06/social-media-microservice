const Media = require('../models/Media')
const logger = require('../utils/logger')
const { deleteToMediaCloudinary } = require('../utils/cloudinary')

const handlePostDelete = async(event)=>{
    console.log(event , "eventevent")

    const {postId , mediaIds} = event

    try {
    const mediaTodelete = await Media.find({_id : {$in : mediaIds}})

    for(const media of mediaTodelete){
        await deleteToMediaCloudinary(media.publicId)
        await Media.findByIdAndDelete(media._id)
    }

    logger.info(`Deleted the media ${media._id} associated with post ${postId}`)

    logger.info(`Processing for deleting the post ${postId}`)

    } catch (error) {
        logger.error(error, "Error occured while media deletion");
    }
}

module.exports = { handlePostDelete }
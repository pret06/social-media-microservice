const Media = require('../models/Media')
const { uplaodToMediaCloudinary } = require('../utils/cloudinary')
const logger = require('../utils/logger')

const uploadMedia = async(req,res) =>{
    logger.info("Starting processing Post media Service")
    try {
        console.log(req.file , " : req.file")
        if(!req.file){
            logger.warn("No file, Kindly provide a file to process further !")
            return res.status(404).json({
                success : false,
                message : "No file provided Kindly provide a file to process further"
            })
        }

        const {originaname , mimietype , buffer} = req.file

        logger.info(`File Uploading details name : ${originaname} of type ${mimietype}`)
        logger.info('Uploading to cloudinary...')

        const cloudinaryMediaUpload = await uplaodToMediaCloudinary(req.file)
        logger.info(`Media uploaded successfully ! , PublicId : ${cloudinaryMediaUpload.publicId}`)

        // Now save the New upload Media to the DB

        const newlyCreatedMedia = new Media({
            publicId : cloudinaryMediaUpload.publicId,
            name : originaname,
            mimeType : mimietype,
            url : cloudinaryMediaUpload.secure_url,
            userId
        })

        await newlyCreatedMedia.save()

        return res.status(201).json({
            success : true,
            MediaId : newlyCreatedMedia._id,
            url : newlyCreatedMedia.url,
            message : "Media Uploaded and created in DB"
        })
    } catch (error) {
        logger.error("Error creating media", error);
        res.status(500).json({
        success: false,
        message: "Error creating media",
        });
    }
}

const getAllMedia = async(req,res)=>{
    try {
        const result = await Media.find({ userId :req.user.userId })

        if(result.length === 0){
            logger.error("No Media Upload founded by this user")
            return res.status(404).json({
                success : false,
                messgae : "No media uplaod founded by this user"
            })
        }
        return res.status(200).json({
            success : true,
            result : result,
            message : "Fecthed Successfull"
        })
    } catch (error) {
        logger.error("Some error occured during fetching details" , error.message)
        return res.status(500).json({
            success : false,
            message : "Internal Server error"
        })
    }
}

module.exports = { uploadMedia , getAllMedia }


const cloudinary = require('cloudinary').v2
const logger = require('./logger')

cloudinary.config({
    cloud_name : process.env.cloud_name,
    api_key : process.env.api_key,
    api_secret : process.env.api_secret
})

const uplaodToMediaCloudinary = (file) =>{
    return new Promise((ressolve , reject)=>{
        const uplaod_stream = cloudinary.uploader.upload_stream(
            {resource_type : "auto"},
            (error,result) => {
                if(error){
                    logger.error("Failed to uplaod on cloudinary", error.message)
                    reject(error)
                } else {
                    ressolve(result)
                }
                uplaod_stream.end(file.buffer)
            }
        )
    })
}

const deleteToMediaCloudinary = async(publicId)=>{
    try {
        const result = await cloudinary.uploader.destroy(publicId)
        logger.info("Media deleted succesfully from cloud storage" , publicId)
        return result
    } catch (error) {
        logger.error("Unable to delete ,Something went wrong !", error.message)
        throw error
    }
}

module.exports = { uplaodToMediaCloudinary , deleteToMediaCloudinary }
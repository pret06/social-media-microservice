const express = require('express')
const { getAllMedia , uploadMedia } = require('../controllers/Media-controller')
const logger = require('logger')
const {authenticateUser} = require('../middlewares/auth-handler')
const multer = require('multer')

const router = express.Router()


const upload = multer({
    storage : multer.memoryStorage(),
    limits : {
        fileSize : 5 * 1024 * 1024
    }
}).single('file')



router.post('/upload' , authenticateUser , (req,res,next)=>{
    upload(req,res, function(err){
        if(err instanceof multer.MulterError){
            logger.error('error while uploading the file' ,err)
            return res.status(400).json({
                sucess : false,
                message : "Error while uploading the file !"
            })
        } else if (err) {
            logger.error('Unreconized error occured while uplaoding' ,err)
            return res.status(400).json({
                success : false,
                message : 'Some unreconized error ouccerd'
            })
        }

        if(!req.file){
            logger.warn('Can not upload the file, file needed !')
            return res.status(400).json({
                success : false,
                message : "No file founded"
            })
        }
        next()
    })

}, uploadMedia)

router.get('/getAllMedia' , authenticateUser , getAllMedia)

module.exports = router
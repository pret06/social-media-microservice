const Joi = require('joi')

const validateCreatepost = (data) =>{
    const schema = Joi.object({
        content : Joi.string().min(3).max(50).required(),
        mediaIds : Joi.array()
    })
    return schema.validate(data)
}

module.exports = { validateCreatepost }
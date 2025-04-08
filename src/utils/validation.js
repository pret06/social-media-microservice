const Joi = require('joi')
const joi = require('joi')

const validationRegistration = (data) =>{
    const schema = Joi.object({
        username : joi.string().min(3).max(50).required(),
        email : joi.string().email().required(),
        password : joi.string().min(3).max(50).required()
    })
    return schema.validate(data)
}

const validLogin = (data) =>{
    const schema = Joi.object({
        email : joi.string().email().required(),
        password : joi.string().min(3).max(50).required()
    })
    return schema.validate(data)
}

module.exports = { validLogin , validationRegistration }
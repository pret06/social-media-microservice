const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const RefreshToken = require('../models/RefreshToken')

const genrateTokens  = async(user)=>{
    const accessToken = jwt.sign({
        userId : user._id,
        username : user.username
    },
    process.env.JWT_SECRET,
    {expiresIn : "60m"}
)

const refreshtoken = crypto.randomBytes(40).toString("hex")
const expiresAt = new Date()
expiresAt.setDate(expiresAt.getDate() + 7)       // Refersh the token after 7 days

await RefreshToken.create({    // Save the refresh token into the DB
    token : refreshtoken,
    user : user._id,
    expiresAt
})

return { accessToken , refreshtoken }

}

module.exports = genrateTokens
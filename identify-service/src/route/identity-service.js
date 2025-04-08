const express = require('express')
const { userRegistration, loginUser, refresftokenUser, logoutUser } = require('../controller/identity-controller')
const router = express.Router()

router.post('/register' , userRegistration)
router.post('/login' , loginUser)
router.post('/refresh-token' ,refresftokenUser)
router.post('/logout', logoutUser)

module.exports = router
const express = require('express')
const { searchController } = require('../controller/Search-controller')
const { authenticateuser } = require('../middleware/authenticate')
const router = express.Router()
const app = express()

app.use(authenticateuser)

router.post('/search-posts' , searchController)

module.exports = router
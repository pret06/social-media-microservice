const express = require('express')
const app = express()

const {
createPost,
getAllposts,
getpost,
deletepost
} = require('../controller/post-media-controller')
const {authenticateuser} = require('../middleware/auth-middleware')

const router = express.Router()

// Middleware to authenticate user
app.use(authenticateuser)

router.post("/create-post", createPost)
router.get("/all-posts", getAllposts)
router.get("/:id" , getpost)
router.delete("/:id" , deletepost)

module.exports = router


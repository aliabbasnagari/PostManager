const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Post = require("../models/Post");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { s3 } = require("../config/aws");
const User = require("../models/User");

// Configure multer for S3 upload
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "-" + file.originalname);
    }
  })
});

// Get all posts
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.findAll();
    // Get user details for each post
    const postsWithUsers = await Promise.all(
      posts.map(async (post) => {
        const user = await User.findById(post.userId);
        return {
          ...post,
          user: { username: user.username }
        };
      })
    );
    res.json(postsWithUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Create a post
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { content } = req.body;
    const image = req.file ? req.file.location : null;

    const post = await Post.create({
      userId: req.user.id,
      content,
      image
    });

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });
    if (post.user.toString() !== req.user.id)
      return res.status(401).json({ msg: "User not authorized" });

    post = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Delete a post
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    if (post.userId !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await Post.delete(req.params.id);
    res.json({ msg: "Post removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;

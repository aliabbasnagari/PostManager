const express = require("express");
const router = express.Router();
const auth = require("./auth");
const Post = require("../models/Post");
const User = require("../models/User");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { s3Client } = require("../config/aws");

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, `public/${Date.now()}-${file.originalname}`);
    },
  }),
});

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.findAll();
    const postsWithUsers = await Promise.all(
      posts.map(async (post) => {
        const user = await User.findById(post.userId);
        return {
          ...post,
          user: { username: user ? user.username : "Unknown" },
        };
      })
    );
    res.json(postsWithUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { content } = req.body;
    const image = req.file ? req.file.location : null;

    const post = await Post.create({
      userId: req.user.id,
      content,
      image,
    });

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

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

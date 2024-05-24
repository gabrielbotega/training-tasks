import express, { Router } from "express";

import feedController from "../controllers/feed.js";

const router: Router = express.Router();

// Get all posts
router.get("/posts", feedController.getPosts);

// Post a post
router.post("/post", feedController.createPost);

// update a post
router.put("/post/:postId", feedController.updatePost);

export default router;

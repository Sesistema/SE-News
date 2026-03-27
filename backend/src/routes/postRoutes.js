const express = require("express");
const {
  getPublicPosts,
  getHighlights,
  getPostBySlugOrId,
  getMeta
} = require("../controllers/postController");
const asyncHandler = require("../middleware/asyncHandler");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", asyncHandler(getPublicPosts));
router.get("/highlights", asyncHandler(getHighlights));
router.get("/meta", asyncHandler(getMeta));
router.get("/:slugOrId/private", requireAuth, asyncHandler(getPostBySlugOrId));
router.get("/:slugOrId", asyncHandler(getPostBySlugOrId));

module.exports = router;

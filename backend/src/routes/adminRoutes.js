const express = require("express");
const {
  getAdminPosts,
  createPost,
  updatePost,
  deletePost,
  getAdminLogs
} = require("../controllers/postController");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const upload = require("../middleware/upload");

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/posts", asyncHandler(getAdminPosts));
router.post("/posts", upload.single("image"), asyncHandler(createPost));
router.put("/posts/:id", upload.single("image"), asyncHandler(updatePost));
router.delete("/posts/:id", asyncHandler(deletePost));
router.get("/logs", asyncHandler(getAdminLogs));

module.exports = router;

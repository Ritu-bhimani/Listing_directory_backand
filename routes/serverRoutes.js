const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const categoryRoutes = require("./categoryRoutes");
const cityRoutes = require("./cityRoutes");
const listingRoutes = require("./listingRoutes");
const uploadRoutes = require("./uploadRoutes");
const notificationRoutes = require("./notificaionRoutes");

const router = express.Router();

router.use("/api/auth", authRoutes);
router.use("/api/user", userRoutes);
router.use("/api/category", categoryRoutes);
router.use("/api/city", cityRoutes);
router.use("/api/listing", listingRoutes);
router.use("/api/upload", uploadRoutes);
router.use("/api/notification", notificationRoutes);


module.exports = router;





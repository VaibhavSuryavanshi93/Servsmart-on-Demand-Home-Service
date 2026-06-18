import express from "express";
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  updateServiceStatus,
  getRecommendations,
  getProviderDashboard,
} from "../controllers/service.controller";
import {
  checkDB,
  authenticateToken,
  authenticateAdmin,
  authenticateProvider,
} from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = express.Router();

router.get("/", checkDB, getServices);
router.get("/recommendations", checkDB, authenticateToken, getRecommendations);
router.get(
  "/provider/dashboard",
  checkDB,
  authenticateToken,
  authenticateProvider,
  getProviderDashboard,
);
router.get("/:id", checkDB, getServiceById);
router.post(
  "/",
  checkDB,
  authenticateToken,
  authenticateProvider,
  upload.single("imageFile"),
  createService,
);
router.patch(
  "/:id",
  checkDB,
  authenticateToken,
  authenticateProvider,
  upload.single("imageFile"),
  updateService,
);
router.delete(
  "/:id",
  checkDB,
  authenticateToken,
  authenticateProvider,
  deleteService,
);
// Admin only status update
router.patch(
  "/:id/status",
  checkDB,
  authenticateToken,
  authenticateAdmin,
  updateServiceStatus,
);

export default router;

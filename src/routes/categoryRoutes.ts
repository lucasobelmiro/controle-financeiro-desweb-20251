import { Router } from "express";
import { CategoryController } from "../controllers/CategoryController";
import { CategoryService } from "../services/categoryService";
import { CategoryRepository } from "../repository/CategoryRepository";
import { authenticateJWT } from "../middlewares/authMiddleware";

const router = Router();

const categoryRepository = new CategoryRepository();
const categoryService = new CategoryService(categoryRepository);
const categoryController = new CategoryController(categoryService);

router.post("/", authenticateJWT, (req, res) =>
  categoryController.create(req, res)
);
router.get("/", authenticateJWT, (req, res) =>
  categoryController.getAll(req, res)
);
router.get("/:id", authenticateJWT, (req, res) =>
  categoryController.getById(req, res)
);
router.put("/:id", authenticateJWT, (req, res) =>
  categoryController.update(req, res)
);
router.delete("/:id", authenticateJWT, (req, res) =>
  categoryController.delete(req, res)
);

export default router;

import { Router } from "express";
import { CategoryController } from "../controllers/CategoryController";
import { CategoryService } from "../services/categoryService";
import { CategoryRepository } from "../repository/CategoryRepository";

const router = Router();

const categoryRepository = new CategoryRepository();
const categoryService = new CategoryService(categoryRepository);
const categoryController = new CategoryController(categoryService);

router.post("/", (req, res) => categoryController.create(req, res));
router.get("/", (req, res) => categoryController.getAll(req, res));
router.get("/:id", (req, res) => categoryController.getById(req, res));
router.put("/:id", (req, res) => categoryController.update(req, res));
router.delete("/:id", (req, res) => categoryController.delete(req, res));

export default router;

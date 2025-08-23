import { Request, Response } from "express";
import { CategoryService } from "../services/categoryService";
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  async create(req: Request, res: Response) {
    try {
      const { name } = req.body;
      const category = await this.categoryService.createCategory(name);
      return res.status(201).json(category);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    const categories = await this.categoryService.getAllCategories();
    return res.json(categories);
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const category = await this.categoryService.getCategoryById(Number(id));
      return res.json(category);
    } catch (error: any) {
      return res.status(404).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const category = await this.categoryService.updateCategory(
        Number(id),
        name
      );
      return res.json(category);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.categoryService.deleteCategory(Number(id));
      return res.status(204).send();
    } catch (error: any) {
      const msg = String(error.message || "");
      if (msg === "Categoria não encontrada") {
        return res.status(404).json({ message: msg });
      }
      if (msg.includes("transações associadas")) {
        return res.status(400).json({ message: msg });
      }
      return res.status(400).json({ message: msg });
    }
  }
}

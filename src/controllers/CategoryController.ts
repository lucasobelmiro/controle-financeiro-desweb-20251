import { Request, Response } from "express";
import { CategoryRepository } from "../repository/CategoryRepository";

const categoryRepo = new CategoryRepository();

export class CategoryController {
  async create(req: Request, res: Response) {
    const { name, type } = req.body;
    try {
      const category = await categoryRepo.createCategory(name, type);
      return res.status(201).json(category);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Erro ao criar categoria", error });
    }
  }

  async getAll(req: Request, res: Response) {
    const categories = await categoryRepo.getAllCategories();
    return res.json(categories);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const category = await categoryRepo.getCategoryById(Number(id));
    if (!category) {
      return res.status(404).json({ message: "Categoria não encontrada" });
    }
    return res.json(category);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const category = await categoryRepo.getCategoryById(Number(id));
    if (!category) {
      return res.status(404).json({ message: "Categoria não encontrada" });
    }
    const { name, type } = req.body;
    try {
      await category.update({ name, type });
      return res.json(category);
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Erro ao atualizar categoria", error });
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const success = await categoryRepo.deleteCategory(Number(id));
    if (!success) {
      return res.status(404).json({ message: "Categoria não encontrada" });
    }
    return res.status(204).send();
  }
}

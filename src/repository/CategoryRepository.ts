import { Category } from "../models/Category";

export class CategoryRepository {
  async createCategory(name: string, type: "entrada" | "saida") {
    return await Category.create({ name, type });
  }

  async getAllCategories() {
    return await Category.findAll();
  }

  async getCategoryById(id: number) {
    return await Category.findByPk(id);
  }

  async deleteCategory(id: number) {
    const category = await Category.findByPk(id);
    if (category) {
      await category.destroy();
      return true;
    }
    return false;
  }

  async updateCategory(id: number, data: Partial<Category>) {
    const category = await this.getCategoryById(id);
    if (!category) return null;
    return await category.update(data);
  }
}

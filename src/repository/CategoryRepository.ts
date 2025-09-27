import { Op } from "sequelize";
import { Category } from "../models/Category";

export class CategoryRepository {
  async createCategory(name: string, userId: number | null, isGlobal: boolean) {
    return await Category.create({ name, userId, isGlobal });
  }

  async getAllCategoriesVisible(userId: number) {
    return await Category.findAll({
      where: { [Op.or]: [{ isGlobal: true }, { userId }] },
      order: [["name", "ASC"]],
    });
  }

  async getCategoryByIdVisible(id: number, userId: number) {
    return await Category.findOne({
      where: { id, [Op.or]: [{ isGlobal: true }, { userId }] },
    });
  }

  async getCategoryByNameForUserOrGlobal(name: string, userId: number) {
    return await Category.findOne({
      where: { name, [Op.or]: [{ isGlobal: true }, { userId }] },
    });
  }

  async getOwnCategoryById(id: number, userId: number) {
    return await Category.findOne({
      where: { id, userId, isGlobal: false },
    });
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
    const category = await Category.findByPk(id);
    if (!category) return null;
    return await category.update(data);
  }
}

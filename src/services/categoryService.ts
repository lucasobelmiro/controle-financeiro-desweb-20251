import { CategoryRepository } from "../repository/CategoryRepository";
import { TransactionRepository } from "../repository/TransactionRepository";

export class CategoryService {
  constructor(private categoryRepo: CategoryRepository) {}

  private validateName(name: string) {
    if (!name || name.trim() === "")
      throw new Error("O nome da categoria é obrigatório");
    if (name.trim().length < 2 || name.trim().length > 50) {
      throw new Error("O nome da categoria é inválido");
    }
  }

  async createCategory(
    name: string,
    userId: number,
    isGlobal: boolean,
    isAdmin: boolean
  ) {
    this.validateName(name);
    if (isGlobal && !isAdmin) {
      throw new Error("Apenas administradores podem criar categorias globais");
    }
    const dup = await this.categoryRepo.getCategoryByNameForUserOrGlobal(
      name.trim(),
      userId
    );
    if (dup) throw new Error("Já existe uma categoria com esse nome");

    const owner = isGlobal ? null : userId;
    return await this.categoryRepo.createCategory(
      name.trim(),
      owner,
      !!isGlobal
    );
  }

  async getAllCategories(userId: number) {
    return await this.categoryRepo.getAllCategoriesVisible(userId);
  }

  async getCategoryById(id: number, userId: number) {
    const category = await this.categoryRepo.getCategoryByIdVisible(id, userId);
    if (!category) throw new Error("Categoria não encontrada");
    return category;
  }

  async updateCategory(id: number, name: string, userId: number) {
    this.validateName(name);
    const own = await this.categoryRepo.getOwnCategoryById(id, userId);
    if (!own) throw new Error("Categoria não encontrada");

    const dup = await this.categoryRepo.getCategoryByNameForUserOrGlobal(
      name.trim(),
      userId
    );
    if (dup && dup.id !== id)
      throw new Error("Já existe uma categoria com esse nome");

    const category = await this.categoryRepo.updateCategory(id, {
      name: name.trim(),
    });
    if (!category) throw new Error("Categoria não encontrada");
    return category;
  }

  async deleteCategory(id: number, userId: number) {
    const own = await this.categoryRepo.getOwnCategoryById(id, userId);
    if (!own) throw new Error("Categoria não encontrada");

    const txRepo = new TransactionRepository();
    const hasTx = await txRepo.hasTransactionsByCategory(id);
    if (hasTx) {
      throw new Error(
        "Não é possível excluir categoria com transações associadas"
      );
    }
    await this.categoryRepo.deleteCategory(id);
  }
}

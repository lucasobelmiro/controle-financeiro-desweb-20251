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

  async createCategory(name: string) {
    this.validateName(name);
    const existing = await this.categoryRepo.getCategoryByName(name);
    if (existing) throw new Error("Já existe uma categoria com esse nome");
    return await this.categoryRepo.createCategory(name);
  }

  async getAllCategories() {
    return await this.categoryRepo.getAllCategories();
  }

  async getCategoryById(id: number) {
    const category = await this.categoryRepo.getCategoryById(id);
    if (!category) throw new Error("Categoria não encontrada");
    return category;
  }

  async updateCategory(id: number, name: string) {
    this.validateName(name);
    const dup = await this.categoryRepo.getCategoryByName(name);
    if (dup && dup.id !== id)
      throw new Error("Já existe uma categoria com esse nome");

    const category = await this.categoryRepo.updateCategory(id, { name });
    if (!category) throw new Error("Categoria não encontrada");
    return category;
  }

  async deleteCategory(id: number) {
    const category = await this.categoryRepo.getCategoryById(id);
    if (!category) throw new Error("Categoria não encontrada");

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

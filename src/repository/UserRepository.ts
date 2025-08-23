import User, { UserAttributes, UserCreationAttributes } from "../models/User";

export class UserRepository {
  async create(userData: UserCreationAttributes): Promise<User> {
    return User.create(userData);
  }

  async findAll(): Promise<User[]> {
    return User.findAll();
  }

  async findById(id: number): Promise<User | null> {
    return User.findByPk(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }

  async update(
    id: number,
    updates: Partial<UserAttributes>
  ): Promise<[number, User[]]> {
    return User.update(updates, { where: { id }, returning: true });
  }

  async delete(id: number): Promise<number> {
    return User.destroy({ where: { id } });
  }
}

import { UserRepository } from "../repository/UserRepository";
import { User } from "../models/User";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { TransactionRepository } from "../repository/TransactionRepository";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class UserService {
  constructor(
    private userRepository: UserRepository,
    private transactionRepository: TransactionRepository = new TransactionRepository()
  ) {}

  private jwtSecret: jwt.Secret = (process.env.JWT_SECRET ||
    "defaultSecret") as jwt.Secret;

  async createUser(userData: Partial<User>): Promise<User> {
    if (!userData.email || !userData.password) {
      throw new Error("Email e senha são obrigatórios");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error("Email inválido");
    }
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) throw new Error("E-mail já cadastrado");

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    return this.userRepository.create({
      name: userData.name!,
      email: userData.email,
      password: hashedPassword,
      role: (userData.role as any) || "user",
    });
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | null> {
    if (updates.email && !emailRegex.test(updates.email)) {
      throw new Error("Erro ao atualizar usuário");
    }
    const [rows, users] = await this.userRepository.update(id, updates);
    return rows > 0 ? users[0] : null;
  }

  async deleteUser(id: number): Promise<boolean> {
    const hasTx = await this.transactionRepository.hasTransactionsByUser(id);
    if (hasTx) {
      throw new Error(
        "Não é possível excluir usuário com transações associadas"
      );
    }
    const deletedCount = await this.userRepository.delete(id);
    return deletedCount > 0;
  }

  async authenticate(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error("Usuário ou senha inválidos");

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new Error("Usuário ou senha inválidos");

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      this.jwtSecret,
      {
        expiresIn: "1h",
      }
    );
    return { user, token };
  }

  async promoteToAdmin(userId: number) {
    const [rows, users] = await this.userRepository.update(userId, {
      role: "admin",
    } as any);
    if (!rows) throw new Error("Usuário não encontrado");
    return users[0];
  }
}

import { Request, Response } from "express";
import { UserRepository } from "../repository/UserRepository";

const userRepo = new UserRepository();

export class UserController {
  async create(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      const user = await userRepo.createUser(name, email, password);
      return res.status(201).json(user);
    } catch (error) {
      return res.status(500).json({ message: "Erro ao criar usuário", error });
    }
  }

  async getAll(req: Request, res: Response) {
    const users = await userRepo.getAllUsers();
    return res.json(users);
  }

  async getById(req: Request, res: Response) {
    const user = await userRepo.getUserById(Number(req.params.id));
    if (!user)
      return res.status(404).json({ message: "Usuário não encontrado" });
    return res.json(user);
  }

  async update(req: Request, res: Response) {
    const user = await userRepo.getUserById(Number(req.params.id));
    if (!user)
      return res.status(404).json({ message: "Usuário não encontrado" });
    const updated = await user.update(req.body);
    return res.json(updated);
  }

  async delete(req: Request, res: Response) {
    const user = await userRepo.getUserById(Number(req.params.id));
    if (!user)
      return res.status(404).json({ message: "Usuário não encontrado" });
    await user.destroy();
    return res.status(204).send();
  }
}

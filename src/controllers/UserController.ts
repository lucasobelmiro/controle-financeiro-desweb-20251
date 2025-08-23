import { Request, Response } from "express";
import { UserService } from "../services/userService";

export class UserController {
  constructor(private userService: UserService) {}

  async register(req: Request, res: Response) {
    try {
      const user = await this.userService.createUser(req.body);
      return res.status(201).json(user);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const authData = await this.userService.authenticate(email, password);
      return res.json(authData);
    } catch (error: any) {
      return res.status(401).json({ message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    const users = await this.userService.getAllUsers();
    return res.json(users);
  }

  async getById(req: Request, res: Response) {
    const user = await this.userService.getUserById(Number(req.params.id));
    if (!user)
      return res.status(404).json({ message: "Usuário não encontrado" });
    return res.json(user);
  }

  async update(req: Request, res: Response) {
    try {
      const updatedUser = await this.userService.updateUser(
        Number(req.params.id),
        req.body
      );
      if (!updatedUser)
        return res.status(404).json({ message: "Usuário não encontrado" });
      return res.json(updatedUser);
    } catch (error: any) {
      return res
        .status(400)
        .json({ message: error.message || "Erro ao atualizar usuário" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const deleted = await this.userService.deleteUser(Number(req.params.id));
      if (!deleted)
        return res.status(404).json({ message: "Usuário não encontrado" });
      return res.status(204).send();
    } catch (error: any) {
      if (error.message.includes("transações associadas")) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(400).json({ message: error.message });
    }
  }
}

import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";

export function requireRole(role: "admin") {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Não autenticado" });
    if (req.user.role !== role)
      return res.status(403).json({ message: "Acesso negado" });
    next();
  };
}

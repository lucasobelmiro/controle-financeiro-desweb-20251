import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { UserService } from "../services/userService";
import { UserRepository } from "../repository/UserRepository";
import { authenticateJWT } from "../middlewares/authMiddleware";
import { requireRole } from "../middlewares/requireRole";

const router = Router();
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.post("/register", (req, res) => userController.register(req, res));
router.post("/login", (req, res) => userController.login(req, res));

router.get("/", authenticateJWT, requireRole("admin"), (req, res) =>
  userController.getAll(req, res)
);
router.get("/:id", authenticateJWT, (req, res) =>
  userController.getById(req, res)
);
router.put("/:id", authenticateJWT, (req, res) =>
  userController.update(req, res)
);
router.delete("/:id", authenticateJWT, (req, res) =>
  userController.delete(req, res)
);

export default router;

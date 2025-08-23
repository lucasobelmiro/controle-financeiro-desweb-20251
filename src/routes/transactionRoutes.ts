import { Router } from "express";
import { TransactionController } from "../controllers/TransactionController";
import { TransactionService } from "../services/transactionService";
import { TransactionRepository } from "../repository/TransactionRepository";
import { CategoryRepository } from "../repository/CategoryRepository";
import { authenticateJWT } from "../middlewares/authMiddleware";
import { withPagination } from "../middlewares/pagination";

const router = Router();
const transactionRepository = new TransactionRepository();
const categoryRepository = new CategoryRepository();
const transactionService = new TransactionService(
  transactionRepository,
  categoryRepository
);
const transactionController = new TransactionController(transactionService);

router.post("/", authenticateJWT, (req, res) =>
  transactionController.create(req, res)
);
router.get("/", authenticateJWT, (req, res) =>
  transactionController.getAll(req, res)
);
router.get("/summary", authenticateJWT, (req, res) =>
  transactionController.summary(req as any, res)
);
router.get("/breakdown", authenticateJWT, (req, res) =>
  transactionController.breakdown(req as any, res)
);
router.get(
  "/user/:userId",
  authenticateJWT,
  withPagination(10, 100),
  (req, res) => transactionController.getByUser(req as any, res)
);
router.get("/category/:categoryId", authenticateJWT, (req, res) =>
  transactionController.getByCategory(req, res)
);
router.get("/:id", authenticateJWT, (req, res) =>
  transactionController.getById(req, res)
);
router.put("/:id", authenticateJWT, (req, res) =>
  transactionController.update(req, res)
);
router.delete("/:id", authenticateJWT, (req, res) =>
  transactionController.delete(req, res)
);
router.get("/extrato/:userId", authenticateJWT, (req, res) =>
  transactionController.getExtrato(req, res)
);

export default router;

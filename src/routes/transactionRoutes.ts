import { Router } from "express";
import { TransactionController } from "../controllers/TransactionController";

const router = Router();
const transactionController = new TransactionController();

router.post("/", transactionController.create);
router.get("/", transactionController.getAll);
router.get("/user/:userId", transactionController.getByUser);
router.get("/:id", transactionController.getById);
router.put("/:id", transactionController.update);
router.delete("/:id", transactionController.delete);

export default router;

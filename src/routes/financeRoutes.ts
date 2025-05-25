import { Router } from "express";
import {
  //   kiteLogin,
  //   kiteCallback,
  //   uploadExcel,
  //   query,
  chat,
} from "../controllers/financeController";
import multer from "multer";

const router = Router();
const upload = multer({ dest: "uploads/" });

// router.get("/kite-login", kiteLogin);
// router.get("/kite-callback", kiteCallback);
// router.post("/upload", upload.single("excel"), uploadExcel);
// router.post("/query", query);
router.post("/chat", chat);

export default router;

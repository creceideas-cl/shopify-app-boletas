import express from "express";
import { receiveSale } from "../controllers/salesController.js";
const router = express.Router();

// Ruta para recibir una venta, y emitir la boleta
router.post("/", receiveSale);

// Ruta para obtener todas las ventas con filtros
router.get("/", getAllSales);

export default router;

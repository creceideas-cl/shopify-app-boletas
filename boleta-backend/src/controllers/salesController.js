import { generateBoleta } from "../services/playwrightService.js";
import db from "../utils/db.js";

/**
{
  servicio: {
    rut: "15896409-0",
    pass: "82376143",
  },
  cabecera: {
    total: 505,
    numOrden: "OC-123456",
    timestamp: "2025-09-24",
    tipoBoleta: "Afecta", // Afecta o Exenta
    tipoPago: "Pago Electrónico", // Efectivo, Transferencia Electrónica, Pago Electrónico, Otro
  },
  cliente: {
    nombre: "Carolina Garcia",
    rut: "15882575-9",
    direccion: "Av. Siempre Viva 123",
    ciudad: "Osorno",
    email: "carolina@creceideas.cl",
    fono: "56988929181",
  },
  productos: [
    {
      codigo: "001",
      detalle: "producto de prueba",
      cantidad: 1,
      valor: 502,
    },
    {
      codigo: "002",
      detalle: "producto de prueba",
      cantidad: 1,
      valor: 503,
    },
    {
      codigo: "003",
      detalle: "producto de prueba",
      cantidad: 1,
      valor: 504,
    },
  ],
}
 */

export const receiveSale = async (req, res) => {
  try {
    const saleData = req.body;

    const [result] = await db.query(
      "INSERT INTO sales (order_id, customer, total, status) VALUES (?, ?, ?, ?)",
      [
        saleData.cabecera.numOrden,
        saleData.cliente.rut,
        saleData.cabecera.total,
        "pending",
      ]
    );

    const boletaPath = await generateBoleta(saleData);

    await db.query(
      "UPDATE sales SET status = ?, boleta_path = ? WHERE id = ?",
      ["completed", boletaPath, result.insertId]
    );

    res.status(200).json({ success: true, boletaPath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error procesando la venta" });
  }
};

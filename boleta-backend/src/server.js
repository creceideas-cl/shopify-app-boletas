import dotenv from "dotenv";
dotenv.config();

import express from "express";
const app = express();

import cors from "cors";
import bodyParser from "body-parser";

import salesRoutes from "./routes/sales.js";
//import webhookRoutes from "./routes/webhook.js";

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => res.send("🚀"));

// Rutas principales
app.use("/api/sales", salesRoutes);
//app.use("/api/webhooks", webhookRoutes);

//app.use("/auth", authRoutes);
//app.use("/api", apiRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));

# Shopify Boleta Backend

Backend en Node.js + Express + MySQL + Playwright.

## Instrucciones

1. Copiar `.env.example` a `.env` y configurar credenciales.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Correr en desarrollo:
   ```bash
   npm run dev
   ```
4. Correr en producción con PM2:
   ```bash
   npm start
   ```

## POST A `/api/sales`

Recibe datos de una venta y genera una boleta en PDF.

**Request Body:**

```json
{
  "servicio": {
    "rut": "15896409-0",
    "pass": "82376143"
  },
  "cabecera": {
    "total": 505,
    "numOrden": "OC-123456",
    "timestamp": "2025-09-24",
    "tipoBoleta": "Afecta", // Afecta o Exenta
    "tipoPago": "Pago Electrónico" // Efectivo, Transferencia Electrónica, Pago Electrónico, Otro
  },
  "cliente": {
    "nombre": "Carolina Garcia",
    "rut": "15882575-9",
    "direccion": "Av. Siempre Viva 123",
    "ciudad": "Osorno",
    "email": "carolina@creceideas.cl",
    "fono": "56988929181"
  },
  "productos": [
    {
      "codigo": "001",
      "detalle": "producto de prueba",
      "cantidad": 1,
      "valor": 502
    },
    {
      "codigo": "002",
      "detalle": "producto de prueba",
      "cantidad": 1,
      "valor": 503
    },
    {
      "codigo": "003",
      "detalle": "producto de prueba",
      "cantidad": 1,
      "valor": 504
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "boletaPath": "./playwright/boleta_123456.pdf"
}
```

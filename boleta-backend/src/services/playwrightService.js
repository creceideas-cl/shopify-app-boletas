import { chromium } from "playwright";
import nodemailer from "nodemailer";

/** 
const data = {
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
};
**/

async function setupBrowser() {
  const browser = await chromium.launch({
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--start-maximized",
    ],
  });

  const context = await browser.newContext({
    viewport: null,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    locale: "es-CL",
    timezoneId: "America/Santiago",
    geolocation: { latitude: -33.4489, longitude: -70.6693 },
    permissions: ["geolocation"],
    colorScheme: "light",
  });

  // 🧠 INYECTA el script justo aquí
  await context.addInitScript(() => {
    // Evita detección de WebDriver
    Object.defineProperty(navigator, "webdriver", {
      get: () => false,
    });

    // Simula idioma normal
    Object.defineProperty(navigator, "languages", {
      get: () => ["es-CL", "es"],
    });

    // Simula plugins reales
    Object.defineProperty(navigator, "plugins", {
      get: () => [1, 2, 3],
    });

    // Simula disponibilidad de propiedades típicas
    Object.defineProperty(navigator, "hardwareConcurrency", {
      get: () => 4,
    });

    // Canvas fingerprint spoof básico (opcional)
    const toDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function () {
      return toDataURL.apply(this, arguments).replace("A", "B");
    };
  });

  const page = await context.newPage();

  // Aumentar los timeouts globales
  page.setDefaultTimeout(60000); // 60 segundos
  page.setDefaultNavigationTimeout(60000);

  return { browser, context, page };
}

export const generateBoleta = async (saleData) => {
  const { browser, context, page } = await setupBrowser();

  await page.goto("https://eboleta.sii.cl/");

  //espera que la pagina cargue
  await page.waitForTimeout(500);
  await page.waitForLoadState("networkidle");

  //await page.getByRole('textbox', { name: 'Ej: 12345678-' }).click();
  await page
    .getByRole("textbox", { name: "Ej: 12345678-" })
    .fill(saleData.servicio.rut);
  await page.getByRole("textbox", { name: "Ej: 12345678-" }).press("Tab");
  await page
    .getByRole("textbox", { name: "Ingresa tu Clave Tributaria" })
    .fill(saleData.servicio.pass);
  await page.getByRole("button", { name: "Ingresar" }).click();

  //espera que la pagina cargue
  await page.waitForTimeout(500);
  await page.waitForLoadState("networkidle");

  //await page.goto("https://eboleta.sii.cl/emitir/");

  // LOOP PARA ASIGNAR EL VALOR DEL DOCUMENTO
  // si el valor es cero, anula el proceso
  if (saleData.cabecera.total === 0) {
    console.log("no es posible emitir un documento con total 0");
  }
  // si el valor es mayor a 0, asigna el valor
  const totalStr = saleData.cabecera.total.toString();
  for (const char of totalStr) {
    await page.getByRole("button", { name: char, exact: true }).click();
  }

  // EMITIR DOCUMENTO
  await page.getByRole("button", { name: "Emitir" }).click();

  //espera que la pagina cargue
  await page.waitForTimeout(500);
  await page.waitForLoadState("networkidle");

  // SELECCIONA EL TIPO DE BOLETA
  await page.getByRole("button", { name: "Boleta afecta" }).click();

  // Usar un selector más específico para evitar la ambigüedad
  if (saleData.cabecera.tipoBoleta === "Afecta") {
    await page.locator("#list-item-175-0").click();
  } else if (saleData.cabecera.tipoBoleta === "Exenta") {
    await page.locator("#list-item-175-1").click();
  }

  // SELECCIONA EL TIPO DE PAGO
  await page.getByRole("button", { name: "Elija método de pago" }).click();

  if (saleData.cabecera.tipoPago === "Efectivo") {
    await page.getByText("Efectivo").click();
  } else if (saleData.cabecera.tipoPago === "Transferencia Electrónica") {
    await page.getByText("Transferencia Electrónica").click();
  } else if (saleData.cabecera.tipoPago === "Pago Electrónico") {
    await page.getByText("Pago Electrónico").click();
  } else if (saleData.cabecera.tipoPago === "Otro") {
    await page.getByText("Otro").click();
  }

  // DATOS DEL CLIENTE
  // habilita el switch de cliente
  await page
    .locator(
      ".v-input.my-3 > .v-input__control > .v-input__slot > .v-input--selection-controls__input > .v-input--selection-controls__ripple"
    )
    .first()
    .click();

  await page
    .getByRole("textbox", { name: "RUT con DV receptor" })
    .fill(saleData.cliente.rut);

  //espera que la pagina cargue
  await page.waitForTimeout(500);
  await page.waitForLoadState("networkidle");

  await page.getByRole("textbox", { name: "Nombre receptor" }).click();
  await page
    .getByRole("textbox", { name: "Nombre receptor" })
    .fill(saleData.cliente.nombre);

  const direccion = saleData.cliente.direccion + ", " + saleData.cliente.ciudad;
  await page
    .getByRole("textbox", { name: "Dirección receptor" })
    .fill(direccion);
  await page
    .getByRole("textbox", { name: "E-mail receptor" })
    .fill(saleData.cliente.email);
  await page
    .getByRole("textbox", { name: "Teléfono receptor" })
    .fill(saleData.cliente.fono);

  // EMITIR DOCUMENTO
  await page
    .locator("#app")
    .getByRole("document")
    .getByRole("button", { name: "Emitir" })
    .click();

  // ENVIAR EMAIL
  await page
    .locator("div")
    .filter({ hasText: /^send$/ })
    .first()
    .click();

  // LIMPIAR CONTEXTO Y CERRAR VENTANA
  await context.close();
  await browser.close();

  //
  //
  //
  //
  // VALIDAR SIGUIENTE CODIGO PARA FUNCIONAMIENTO CORRECTO
  //
  //
  //
  //

  /*
  const pdfPath = `./downloads/boleta_${saleData.id}.pdf`;
  await page.pdf({ path: pdfPath });
  await browser.close();

  const transporter = nodemailer.createTransport({ sendmail: true });
  await transporter.sendMail({
    from: "no-reply@boletas.cl",
    to: saleData.customer_email,
    subject: "Boleta de tu compra",
    text: "Adjuntamos la boleta de tu compra.",
    attachments: [{ path: pdfPath }],
  });

  return pdfPath;
  */
};

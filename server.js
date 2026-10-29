// server.js - Punto de entrada para Phusion Passenger (cPanel / Namecheap)
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    }).listen(port, () => {
      console.log(`> Servidor Mudeco Palets activo en puerto ${port} (producción: ${!dev})`);
    });
  })
  .catch((err) => {
    console.error("Error al iniciar la aplicación Next.js en cPanel:", err);
    process.exit(1);
  });

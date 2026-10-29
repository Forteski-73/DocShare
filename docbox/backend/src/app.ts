import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { apiRoutes } from "./routes";
import { swaggerSpec } from "./config/swagger";
import { errorHandler } from "./middlewares/errorHandler.middleware";

export const app = express();

// Em producao o backend fica atras do Nginx (reverse proxy na mesma maquina).
// Sem isso, express-rate-limit rejeita o header X-Forwarded-For por seguranca.
if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Registrado antes do Helmet: o CSP padrao do Helmet bloqueia os scripts/estilos
// inline que o swagger-ui-express usa. So disponivel fora de producao.
if (env.NODE_ENV !== "production") {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.use(
  helmet({
    // O frontend (porta 5173) carrega imagens/arquivos do backend (porta 3333) via <img>/<a>.
    // O padrao "same-origin" do Helmet bloqueia esse embed entre portas diferentes.
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", apiRoutes);

app.use(errorHandler);

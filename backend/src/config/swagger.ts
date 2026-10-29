import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "DocShare API",
      version: "1.0.0",
      description:
        "API do DocShare — gestao de documentos por Produto (Label) / Categoria / Documento.",
    },
    servers: [{ url: "/api" }],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
          description: "JWT em cookie httpOnly, definido no login (POST /auth/login).",
        },
      },
    },
    security: [{ cookieAuth: [] }],
  },
  apis: [
    path.join(__dirname, "../modules/**/*.routes.ts").split(path.sep).join("/"),
    path.join(__dirname, "../modules/**/*.routes.js").split(path.sep).join("/"),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

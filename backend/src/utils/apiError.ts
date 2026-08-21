export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }

  static badRequest(message: string) {
    return new ApiError(400, message);
  }

  static unauthorized(message = "Nao autenticado") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Sem permissao para esta acao") {
    return new ApiError(403, message);
  }

  static notFound(message = "Recurso nao encontrado") {
    return new ApiError(404, message);
  }

  static conflict(message: string) {
    return new ApiError(409, message);
  }
}

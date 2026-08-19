export class AppError extends Error {
  statusCode: number;
  errors: Record<string, string[]> | undefined;

  constructor(
    statusCode: number,
    message: string,
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = "AppError";
  }
}

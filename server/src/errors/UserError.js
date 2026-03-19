export class UserError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'UserError';
    this.statusCode = statusCode;
  }
}

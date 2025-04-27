export class APIError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
  }
}

export class NotFoundError extends APIError {
  constructor(entity: string) {
    super(`${entity.toUpperCase()}_NOT_FOUND`, `${entity} not found`, 404);
  }
}

export class PrivateProfileError extends APIError {
  constructor() {
    super("PROFILE_PRIVATE", "This profile is private", 403);
  }
}

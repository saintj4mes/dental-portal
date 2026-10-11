export class DomainError extends Error {
  constructor(message: string, readonly code: "NOT_FOUND" | "CONFLICT" | "FORBIDDEN" | "CONFIGURATION" = "NOT_FOUND") {
    super(message);
    this.name = "DomainError";
  }
}

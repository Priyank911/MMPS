/**
 * Custom error classes for different layers of the system
 */

export class AppError extends Error {
  constructor(message, statusCode, layer, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.layer = layer;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class PerceptionError extends AppError {
  constructor(message, details = {}) {
    super(message, 500, 'perception', details);
  }
}

export class NormalizationError extends AppError {
  constructor(message, details = {}) {
    super(message, 500, 'normalization', details);
  }
}

export class RefinementError extends AppError {
  constructor(message, details = {}) {
    super(message, 500, 'refinement', details);
  }
}

export class ValidationError extends AppError {
  constructor(message, details = {}) {
    super(message, 400, 'validation', details);
  }
}

export class RoutingError extends AppError {
  constructor(message, details = {}) {
    super(message, 400, 'routing', details);
  }
}

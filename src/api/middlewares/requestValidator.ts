import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

/**
 * Middleware that validates request data using express-validator
 * 
 * @param validations - Array of express-validator validation chains
 * @returns Express middleware function
 * 
 * @example
 * // Usage in a route
 * router.post(
 *   '/users',
 *   validate([
 *     body('name').isString().trim().notEmpty(),
 *     body('email').isEmail(),
 *   ]),
 *   usersController.createUser
 * );
 */
export function validate(validations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }

    // Format validation errors
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : undefined,
      type: error.type,
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined,
    }));

    // Return validation error response
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: formattedErrors,
      },
    });
  };
}
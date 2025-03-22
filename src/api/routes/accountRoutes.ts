import { Router } from 'express';
import { param, query } from 'express-validator';
import { createAccountController } from '../controllers/accountController';
import { createAccountService } from '../services/accountService';
import { createGoogleAuthService } from '../services/googleAuthService';
import { validate } from '../middlewares/requestValidator';

/**
 * Initialize account routes with the Google Auth service
 * @param googleAuthService - Google Auth service instance
 * @returns Configured router
 */
export function createAccountRouter(googleAuthService: ReturnType<typeof createGoogleAuthService>): Router {
  const router = Router();
  const accountService = createAccountService(googleAuthService);
  const accountController = createAccountController(accountService);

  // GET /api/v1/accounts
  router.get(
    '/',
    validate([
      query('page').optional().isInt({ min: 1 }).toInt(),
      query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
      query('sort').optional().isString(),
      query('order').optional().isIn(['asc', 'desc']),
    ]),
    accountController.getAllAccounts
  );

  // GET /api/v1/accounts/:id
  router.get(
    '/:id',
    validate([
      param('id').isString().notEmpty().withMessage('Account ID is required'),
    ]),
    accountController.getAccountById
  );

  return router;
}

// Create default router with app.locals.googleAuthService (populated at runtime)
const router = Router();

// This routes file is executed before the Google Auth service is initialized,
// so we need to wait until the first request to create the controller
router.use((req, res, next) => {
  const googleAuthService = req.app.locals.googleAuthService;
  
  if (!googleAuthService) {
    return next(new Error('Google Auth service not initialized'));
  }
  
  // Create router with the Google Auth service from app.locals
  const accountRouter = createAccountRouter(googleAuthService);
  
  // Forward the request to the router
  return accountRouter(req, res, next);
});

export default router;
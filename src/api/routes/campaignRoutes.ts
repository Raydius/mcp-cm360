import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { createCampaignController } from '../controllers/campaignController';
import { createCampaignService } from '../services/campaignService';
import { createGoogleAuthService } from '../services/googleAuthService';
import { validate } from '../middlewares/requestValidator';

/**
 * Initialize campaign routes with the Google Auth service
 * @param googleAuthService - Google Auth service instance
 * @returns Configured router
 */
export function createCampaignRouter(googleAuthService: ReturnType<typeof createGoogleAuthService>): Router {
  const router = Router();
  const campaignService = createCampaignService(googleAuthService);
  const campaignController = createCampaignController(campaignService);

  // GET /api/v1/campaigns
  router.get(
    '/',
    validate([
      query('accountId').isString().notEmpty().withMessage('Account ID is required'),
      query('page').optional().isInt({ min: 1 }).toInt(),
      query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
      query('sort').optional().isString(),
      query('order').optional().isIn(['asc', 'desc']),
    ]),
    campaignController.getAllCampaigns
  );

  // GET /api/v1/campaigns/:id
  router.get(
    '/:id',
    validate([
      param('id').isString().notEmpty().withMessage('Campaign ID is required'),
    ]),
    campaignController.getCampaignById
  );

  // POST /api/v1/campaigns
  router.post(
    '/',
    validate([
      body('name').isString().trim().notEmpty().withMessage('Name is required'),
      body('advertiserId').notEmpty().withMessage('Advertiser ID is required'),
      body('startDate').isString().notEmpty().withMessage('Start date is required'),
      body('endDate').isString().notEmpty().withMessage('End date is required'),
    ]),
    campaignController.createCampaign
  );

  // PATCH /api/v1/campaigns/:id
  router.patch(
    '/:id',
    validate([
      param('id').isString().notEmpty().withMessage('Campaign ID is required'),
      body('name').optional().isString().trim(),
      body('startDate').optional().isString(),
      body('endDate').optional().isString(),
      body('status').optional().isIn(['ACTIVE', 'ARCHIVED', 'PAUSED']),
    ]),
    campaignController.updateCampaign
  );

  // GET /api/v1/campaigns/:id/performance
  router.get(
    '/:id/performance',
    validate([
      param('id').isString().notEmpty().withMessage('Campaign ID is required'),
      query('startDate').isString().notEmpty().withMessage('Start date is required'),
      query('endDate').isString().notEmpty().withMessage('End date is required'),
    ]),
    campaignController.getCampaignPerformance
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
  const campaignRouter = createCampaignRouter(googleAuthService);
  
  // Forward the request to the router
  return campaignRouter(req, res, next);
});

export default router;
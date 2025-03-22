import { Router } from 'express';
import { param, query } from 'express-validator';
import { createReportController } from '../controllers/reportController';
import { createReportService } from '../services/reportService';
import { createGoogleAuthService } from '../services/googleAuthService';
import { validate } from '../middlewares/requestValidator';

/**
 * Initialize report routes with the Google Auth service
 * @param googleAuthService - Google Auth service instance
 * @returns Configured router
 */
export function createReportRouter(googleAuthService: ReturnType<typeof createGoogleAuthService>): Router {
  const router = Router();
  const reportService = createReportService(googleAuthService);
  const reportController = createReportController(reportService);

  // GET /api/v1/reports
  router.get(
    '/',
    validate([
      query('accountId').isString().notEmpty().withMessage('Account ID is required'),
      query('page').optional().isInt({ min: 1 }).toInt(),
      query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
      query('sort').optional().isString(),
      query('order').optional().isIn(['asc', 'desc']),
    ]),
    reportController.getAllReports
  );

  // GET /api/v1/reports/:id
  router.get(
    '/:id',
    validate([
      param('id').isString().notEmpty().withMessage('Report ID is required'),
    ]),
    reportController.getReportById
  );

  // GET /api/v1/reports/:id/files
  router.get(
    '/:id/files',
    validate([
      param('id').isString().notEmpty().withMessage('Report ID is required'),
    ]),
    reportController.getReportFiles
  );

  // GET /api/v1/reports/:id/files/:fileId
  router.get(
    '/:id/files/:fileId',
    validate([
      param('id').isString().notEmpty().withMessage('Report ID is required'),
      param('fileId').isString().notEmpty().withMessage('File ID is required'),
    ]),
    reportController.getReportFileData
  );

  // POST /api/v1/reports/:id/run
  router.post(
    '/:id/run',
    validate([
      param('id').isString().notEmpty().withMessage('Report ID is required'),
    ]),
    reportController.runReport
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
  const reportRouter = createReportRouter(googleAuthService);
  
  // Forward the request to the router
  return reportRouter(req, res, next);
});

export default router;
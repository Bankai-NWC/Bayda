import { Router } from 'express';

import { UserRoutes } from '../config/routes.config.js';
import userController from '../controllers/user-controller.js';
import { authMiddleware } from '../middlewares/auth-middleware.js';
import { validateData } from '../middlewares/validation-middleware.js';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  userLoginSchema,
  userRegistrationSchema,
  verifyOtpSchema,
} from '../shemas/validate-shema.js';

const router = Router();

router.post(
  UserRoutes.REGISTRATION,
  validateData(userRegistrationSchema),
  userController.registration,
);
router.post(UserRoutes.LOGIN, validateData(userLoginSchema), userController.login);
router.post(
  UserRoutes.RECOVER_PASS.FORGOT_PASSWORD,
  validateData(forgotPasswordSchema),
  userController.forgotPassword,
);
router.post(
  UserRoutes.RECOVER_PASS.VERIFY_OTP,
  validateData(verifyOtpSchema),
  userController.verifyOtp,
);
router.post(
  UserRoutes.RECOVER_PASS.RESET_PASSWORD,
  validateData(resetPasswordSchema),
  userController.resetPassword,
);
router.post(UserRoutes.LOGOUT, userController.logout);
router.get(UserRoutes.PROFILE, authMiddleware, userController.getProfile);
router.post(UserRoutes.REFRESH, userController.refresh);
router.get(UserRoutes.ACTIVATE, userController.activate);
router.post(UserRoutes.RESEND_ACTIVATION, userController.resendActivation);

export default router;

export const UserRoutes = {
  BASE: '/api',
  REGISTRATION: '/registration',
  LOGIN: '/login',
  LOGOUT: '/logout',
  REFRESH: '/refresh',
  ACTIVATE: '/auth/activate/:link',
  RESEND_ACTIVATION: '/resend-activation',
  RECOVER_PASS: {
    FORGOT_PASSWORD: '/forgot-password',
    VERIFY_OTP: '/verify-otp',
    RESET_PASSWORD: '/reset-password',
  },
  PROFILE: '/profile',
} as const;

export const ProductRoutes = {
  BASE: '/api/products',
  createProduct: '/create',
  createVariant: '/:id/variants',
} as const;

import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import type { Express } from 'express';
import express from 'express';

import { ProductRoutes, UserRoutes } from './config/routes.config.js';
import { errorMiddleware } from './middlewares/error-middleware.js';
import analyticsRouter from './routes/analytics-router.js';
import cartRouter from './routes/cart-router.js';
import catalogRouter from './routes/catalog-router.js';
import colorRouter from './routes/color-routee.js';
import orderRouter from './routes/order-router.js';
import productRouter from './routes/product-router.js';
import userRouter from './routes/user-routes.js';
import wishlistRouter from './routes/wishlist-router.js';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }),
);
app.use(UserRoutes.BASE, userRouter);
app.use(ProductRoutes.BASE, productRouter);
app.use('/api', colorRouter);
app.use('/api/catalog', catalogRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/analytics', analyticsRouter);
app.use(errorMiddleware);

const start = async () => {
  try {
    app.listen(PORT, () => {
      console.log('Server is running on port ' + PORT);
    });
  } catch (error) {
    console.log(error);
  }
};

start();

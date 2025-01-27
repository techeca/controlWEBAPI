import express from 'express';
import { userSignIn, refreshToken, validateToken } from '../controllers/Auth.js';
import { authenticateToken } from '../middlewares/jwt.js';

const authRouter = express.Router()

authRouter.post('/signIn', userSignIn);
authRouter.post('/refresh', refreshToken);
authRouter.get('/validateToken', authenticateToken, validateToken);

export default authRouter;
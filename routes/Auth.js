import express from 'express';
import { userSignIn, refreshToken } from '../controllers/Auth.js';

const authRouter = express.Router()

authRouter.post('/signIn', userSignIn);
authRouter.post('/refresh', refreshToken)

export default authRouter;
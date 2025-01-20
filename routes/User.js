import express from 'express';
import { CreateUser, ReadUser } from '../controllers/User.js';

const userRouter = express.Router();

userRouter.get('/read', ReadUser);
userRouter.post('/create', CreateUser);

export default userRouter;
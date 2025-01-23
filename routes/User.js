import express from 'express';
import { CreateUser, DeleteUser, GetAllUsers, ReadUser, UpdateUser } from '../controllers/User.js';
import { authorizeRole } from '../middlewares/Authorization.js';
import { ROLES } from '../utils/contants.js';
import { authenticateToken } from '../middlewares/jwt.js';

const userRouter = express.Router();

userRouter.use(authenticateToken);
userRouter.use(authorizeRole(ROLES.ADMIN))

//userRouter.get('/read', ReadUser);
userRouter.get('/all', GetAllUsers);
userRouter.post('/', CreateUser);
userRouter.delete('/:rut', DeleteUser);
userRouter.put('/:rut', UpdateUser)

export default userRouter;
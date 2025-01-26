import express from 'express';
import { GetControls, CreateControl, GetAllControls } from '../controllers/Control.js';
import { authenticateToken } from '../middlewares/jwt.js';
import { authorizeRole } from '../middlewares/Authorization.js';
import { ROLES } from '../utils/contants.js';

const controlRouter = express.Router();

controlRouter.use(authenticateToken);

controlRouter.get('/', GetControls)
controlRouter.post('/', CreateControl);
controlRouter.get('/all', authorizeRole(ROLES.ADMIN), GetAllControls)

export default controlRouter;
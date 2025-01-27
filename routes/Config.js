import express from 'express'
import { getConfig } from '../controllers/Config.js';
import { authenticateToken } from '../middlewares/jwt.js';
import { authorizeRole } from '../middlewares/Authorization.js';
import { ROLES } from '../utils/contants.js';

const configRouter = express.Router();
configRouter.use(authenticateToken);

configRouter.get('/', authorizeRole(ROLES.ADMIN), getConfig);

export default configRouter;
import express from 'express'
import { daysConfig, getConfig } from '../controllers/Config.js';
import { authenticateToken } from '../middlewares/jwt.js';
import { authorizeRole } from '../middlewares/Authorization.js';
import { ROLES } from '../utils/contants.js';

const configRouter = express.Router();
configRouter.use(authenticateToken);
configRouter.use(authorizeRole(ROLES.ADMIN))

configRouter.get('/', getConfig);
configRouter.put('/days', daysConfig)

export default configRouter;
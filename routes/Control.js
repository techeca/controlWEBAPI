import express from 'express';
import { GetControls, CreateControl } from '../controllers/Control.js';
import { authenticateToken } from '../middlewares/jwt.js';

const controlRouter = express.Router();

controlRouter.use(authenticateToken);

controlRouter.get('/', GetControls)
controlRouter.post('/', CreateControl);

export default controlRouter;
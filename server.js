import express from 'express'
import cors from 'cors';
import dotenv from 'dotenv'
import { handleError } from './middlewares/ErrorHandler.js';
import userRouter from './routes/User.js';
import authRouter from './routes/Auth.js';
import controlRouter from './routes/Control.js';

dotenv.config()
const app = express();

//Se configura json y cors para permitir las solicitudes desde el front
function setupMiddleware() {
    app.use(express.json());
    app.use(cors({
        origin: process.env.FRONT_URL,
        credentials: true,
    }))
}

//Configuración de rutas
function setupRoutes() {
    //app.use('/purchase', PurchaseRouter)
    app.use('/user', userRouter)
    app.use('/auth', authRouter)
    app.use('/control', controlRouter)
}

//Inicio
app.get('/', (req, res) => {
    res.send('API ON')
})

//health
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ON',
        env: process.env.MODE,
    })
})

//Funcion para lanzar API
export async function startServer() {
    const PORT = process.env.PORT;
    try {
        //Se cargan configuración de API
        setupMiddleware();
        setupRoutes();

        //Middleware para manejo de errores
        app.use(handleError);

        app.listen(PORT, () => {
            console.info(`Server is running on http://localhost:${PORT} ${"\x1b[32m"}ON${"\x1b[0m"}`);
        })
    } catch (error) {
        console.log(error);
    }

}
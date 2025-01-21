import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from "@prisma/client";

export async function userSignIn(req, res) {
    const { rut, password } = req.body;

    try {
        // Verificar si las credenciales son válidas
        const { user, routes } = await authenticateUser(rut, password);
        if (!user) { return res.status(401).json({ message: 'Credenciales inválidas' }) }

        // Generar un JWT con una clave secreta y datos del usuario
        const token = jwt.sign(
            { userId: user.id, role: user.type },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.REFRESH_JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.MODE,
            sameSite: 'strict',
            path: '/auth',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
        })

        // Responder con el token y los datos básicos del usuario
        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token,
            user: { id: user.id, name: user.name, type: user.type, email: user.email, rut: user.rut },
            routes: routes
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al intentar realizar signIn' })
    }
}

async function authenticateUser(rut, password) {
    const prisma = new PrismaClient()
    try {
        // Buscar el usuario por rut
        const user = await prisma.user.findFirst({
            where: { rut: rut }
        })

        // Si el usuario no existe, retorna null
        if (!user) return null;

        // Comparar la contraseña ingresada con la almacenada (hashed) en la base de datos
        const isPasswordValid = await bcrypt.compare(password, user.password);

        // Si la contraseña es incorrecta, retorna null
        if (!isPasswordValid) return null;

        // Retorna el usuario autenticado sin la contraseña
        const { password: _, ...userWithoutPassword } = user;
        let routes

        if (user.type === 'USER') {
            routes = await prisma.routes.findFirst({
                where: { type: 'USER' }
            })
        } else if (user.type === 'ADMIN') {
            routes = await prisma.routes.findMany()
        }

        // Transformar las rutas en el formato requerido
        const formattedRoutes = routes.map(route => ({
            title: route.title,
            url: route.path,  // Asumo que el URL es una referencia como ejemplo
        }));

        const dataNav = {
            items: [
              {
                title: "Reloj Control",
                url: "#",
                icon: 'Clock9',
                isActive: true,
                items: [
                  {
                    title: "Entrada",
                    url: "entrada",
                  },
                  {
                    title: "Salida",
                    url: "#",
                  }
                ],
              },
              user?.type === 'ADMIN' && {
                title: "Administración",
                url: "#",
                icon: 'MonitorCog',
                items: formattedRoutes
              }
            ],
          }

        return { user: userWithoutPassword, routes: dataNav };
    } catch (error) {
        console.error("Error al autenticar usuario:", error);
        return null;
    } finally {
        prisma.$disconnect();
    }
}

export const refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token no proporcionado' });
    }

    try {
        // Validar el Refresh Token
        const payload = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);

        // Opcional: Verificar si el token existe en la base de datos
        /*const storedToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
        if (!storedToken) {
            return res.status(403).json({ message: 'Refresh token no válido' });
        }*/

        // Generar un nuevo Access Token
        const accessToken = jwt.sign(
            { userId: payload.userId, role: payload.role },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        // Opcional: Rotar el Refresh Token
        const newRefreshToken = jwt.sign(
            { userId: payload.userId },
            process.env.REFRESH_JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Actualizar el token en la base de datos
        await prisma.refreshToken.update({
            where: { token: refreshToken },
            data: { token: newRefreshToken }
        });

        // Enviar el nuevo Refresh Token en la cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.MODE === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
        });

        // Responder con el nuevo Access Token
        res.json({ accessToken });
    } catch (err) {
        console.error("Error al procesar el Refresh Token:", err);
        return res.status(403).json({ message: 'Token inválido o expirado' });
    }
};


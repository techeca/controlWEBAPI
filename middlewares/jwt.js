import jwt from 'jsonwebtoken'

// Middleware de autenticación
export function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer token"
        const SECRET_T = process.env.JWT_SECRET
        
        if (!token) { return res.status(401).json({ message: 'Token no proporcionado' }) }
    
        jwt.verify(token, SECRET_T, (err, user) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    // Token expirado, permitir continuar para que el cliente lo maneje
                    return next();
                }
                return res.status(403).json({ message: 'Token no válido' });
            }
            req.user = user; // Guarda el usuario decodificado en `req.user`
            next();
        });
        
    } catch (error) {
        //console.log(error);
        return res.status(500).json({ message: 'Error al intentar autenticación'})
    }  
}

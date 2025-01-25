// Middleware de autorización
export function authorizeRole(role = 'USER') {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) { return res.status(403).json({ message: 'No tienes permiso para acceder a este recurso' }) }
        next();
    };
}
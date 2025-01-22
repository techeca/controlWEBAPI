export function handleError(err, req, res, next) {
    const status = err.status || 500;
    const message = err.message || "Error interno del servidor";
    const details = err.details || null;
  
    console.error(`[Error] Status: ${status}, Message: ${message}, Details: ${details || "N/A"}`);
  
    res.status(status).json({
      error: {
        message,
        details,
      },
    });
  }
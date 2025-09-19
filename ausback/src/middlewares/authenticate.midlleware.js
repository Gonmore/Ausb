import jwt from 'jsonwebtoken';
import 'dotenv/config';

const secret = process.env.JWT_SECRET || 'tu_secreto_jwt';

export const generateToken = (user) => {
  return jwt.sign({
    userId: user.id, // ← CAMBIAR de 'id' a 'userId' para consistencia
    username: user.username,
    role: user.role
  }, secret, {
    expiresIn: '7d' // ← CAMBIAR de 1h a 7d para mejor UX
  });
};

export const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1] || req.cookies.jwt;
  
    if (!token) {
      return res.redirect('/login');
    }
  
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.redirect('/login');
      }
  
      req.user = decoded;
      next();
    });
}

export const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Token de acceso requerido'
        });
    }

    const token = authHeader.substring(7);
    
    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
    }
};

// ← AGREGAR MIDDLEWARE PARA ONBOARDING
export function authenticate(req, res, next) {
    return authenticateJWT(req, res, next);
}
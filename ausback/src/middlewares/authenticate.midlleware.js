import jwt from 'jsonwebtoken';
import 'dotenv/config';

const secret = process.env.JWT_SECRET || 'tu_secreto_jwt';

export const generateToken = (user) => {
  return jwt.sign({
    id: user.id,
    username: user.username,
  }, secret, {
    expiresIn: '1h' // El token expira en 1 hora
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

export function authenticateJWT(req, res, next) {
    const authHeader = req.headers['authorization'];
    console.log('authHeader', authHeader);

    const token = authHeader && authHeader.split(' ')[1];
    console.log('token', token);

    if (!token) return res.sendStatus(401);

    const secret = process.env.JWT_SECRET
    jwt.verify(token, secret,(err,user) => {
        if (err) {

            console.log('error: '+err)
            return res.status(403).json({message: err.message})
        }

        console.log('user', user);
        req.user = user;
        next();
    })

}
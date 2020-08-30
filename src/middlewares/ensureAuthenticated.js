import { verify } from 'jsonwebtoken';
import authConfig from '../config/auth';

export default function ensureAuthenticated(req, res, next) {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.json({ error: 'JWT token is missing.' });
  }

  // Bearer token
  const [, token] = authHeader.split(' ');

  try {
    const decoded = verify(token, authConfig.jwt.secret);
    const { id } = decoded;
    
    req.user = {
      id: id,
    }

    return next();
  } catch(err) {
    return res.json({ error: 'Invalid jwt token.' });
  }
}
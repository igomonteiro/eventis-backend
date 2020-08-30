import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import User from '../models/User';
import authConfig from '../../config/auth';

class SessionController {

  async create(req, res) {

    const schema = Yup.object().shape({
      email: Yup.string().required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails'});
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email }});

    if (!user) {
      return res.status(401).json({ error: 'User not found.'});
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Password does not match.'});
    }

    const { id, nickname, name } = user;
    const { secret, expiresIn } = authConfig.jwt;
    
    return res.json({
      user: {
        id,
        name,
        nickname,
        email
      },
      token: jwt.sign({ id }, secret, {
        expiresIn: expiresIn
      }),
    });
  }
}

export default new SessionController();
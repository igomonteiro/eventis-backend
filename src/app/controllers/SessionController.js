import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import User from '../models/User';
import File from '../models/File';
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

    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        }
      ]
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found.'});
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Password does not match.'});
    }

    const { id, name, avatar } = user;
    const { secret, expiresIn } = authConfig.jwt;
    
    return res.json({
      user: {
        id,
        name,
        email,
        avatar
      },
      token: jwt.sign({ id }, secret, {
        expiresIn: expiresIn
      }),
    });
  }
}

export default new SessionController();
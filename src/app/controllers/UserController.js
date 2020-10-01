import * as Yup from 'yup';
import User from '../models/User';
import File from '../models/File';

class UserController {

  async index(req, res) {
    const user = await User.findAll();
    return res.json(user);
  }

  async create(req, res) {

    const schema = Yup.object().shape({
      name: Yup.string().required().min(6).max(46),
      email: Yup.string().required().email(),
      password: Yup.string().required().min(6).max(24),
      confirmPassword: Yup.string().when('password', (password, field) => 
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails'});
    }

    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const { id, name, email } = await User.create(req.body);
    return res.json({
      id,
      name,
      email
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      oldPassword: Yup.string().min(6),
      password: Yup.string().min(6).when('oldPassword', (oldPassword, field) => 
        oldPassword ? field.required() : field
      ),
      confirmPassword: Yup.string().when('password', (password, field) => 
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails'});
    }

    const { oldPassword } = req.body;

    const user = await User.findByPk(req.user.id);

    if(oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match.' });
    }

    await user.update(req.body);
    const { id, name, avatar } = await User.findByPk(req.user.id, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        }
      ]
    });

    return res.json({
      id,
      name,
      avatar
    });
  }
}

export default new UserController();
import Evento from '../models/Evento';
import { Op } from 'sequelize';
import * as Yup from 'yup';

import User from '../models/User';

class EventoController {
  async create(req, res) {
    const schema = Yup.object().shape({
      creator_id: Yup.number().required(),
      title: Yup.string().required(),
      description: Yup.string(),
      location: Yup.string().required(),
      max_users: Yup.number().required().positive().integer(),
      private_event: Yup.bool().required(),
      password: Yup.string().when('private_event', {
        is: true,
        then: Yup.string().required('Private event. Must have a password.')
      }),
      date_limit: Yup.date().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { creator_id, title, description, location, max_users, private_event, password, date_limit, date} = req.body;

    // Checking creatorId
    const isCreator = await User.findOne({ where: { id: creator_id }});

    if (!isCreator) {
      return res.status(401).json({ error: 'You can only create events with creator.'});
    }

    const evento = await Evento.create({
      creator_id,
      title,
      description,
      location,
      max_users,
      private_event,
      password,
      date_limit,
      date,
    });

    return res.json(evento);
  }

  async listAllEvents(req, res) {
    const data = await Evento.findAll({
      where: {
        creator_id: {
          [Op.not]: req.user.id,
        }
      }
    });

    res.json(data);
  }

  async listAllMyEvents(req, res) {
    const data = await Evento.findAll({
      where: {
        creator_id: req.user.id
      }
    });

    res.json(data);
  }
}

export default new EventoController();
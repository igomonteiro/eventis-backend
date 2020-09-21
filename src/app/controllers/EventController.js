import crypto from 'crypto';
import { Op } from 'sequelize';
import { startOfHour, parseISO, isBefore } from 'date-fns';
import * as Yup from 'yup';
import Evento from '../models/Evento';
import Subscription from '../models/Subscription';

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

    const hourStartDate = startOfHour(parseISO(date));
    const hourStartLimitDate = startOfHour(parseISO(date_limit));

    if (isBefore(hourStartDate, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted'});
    }

    if (isBefore(hourStartLimitDate, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted'});
    }

    if (isBefore(hourStartDate, hourStartLimitDate)) {
      return res.status(400).json({ error: 'Limit date can not be greater than event date'});
    }

    const id = crypto.randomBytes(4).toString('HEX');

    const evento = await Evento.create({
      id,
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
    let data = await Evento.findAll({
      where: {
        creator_id: {
          [Op.not]: req.user.id,
        }
      },
    });

    let subs = await Subscription.findAll({
      where: {
        user_id: req.user.id,
      }
    });

    let subscribedEvents = [];

    data.map(event => {
      subs.map(sub => {
        if ((event.id == sub.evento_id) && sub.canceled_at == null) {
          subscribedEvents.push(event);
        }
      })
    });

    data = data.filter(el => !subscribedEvents.includes(el));

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

  async updateEvent(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      max_users: Yup.number().positive().integer(),
      private_event: Yup.bool(),
      password: Yup.string().when('private_event', {
        is: true,
        then: Yup.string().required('Private event. Must have a password.')
      }),
      date_limit: Yup.date(),
      date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails'});
    } 

    const event = await Evento.findByPk(req.params.id);  
    
    let hourStartDate;
    let hourStartLimitDate; 

    if (req.body.date == null && req.body.date_limit != null) {
      hourStartDate = startOfHour(parseISO(event.date));
      hourStartLimitDate = startOfHour(parseISO(req.body.date_limit));
    } else if(req.body.date != null && req.body.date_limit == null) {
      hourStartDate = startOfHour(parseISO(req.body.date));
      hourStartLimitDate = startOfHour(parseISO(event.date_limit));
    } else if (req.body.date != null && req.body.date_limit != null) {
      hourStartDate = startOfHour(parseISO(req.body.date));
      hourStartLimitDate = startOfHour(parseISO(req.body.date_limit));
    }

    if (isBefore(hourStartDate, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted'});
    }

    if (isBefore(hourStartLimitDate, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted'});
    }

    if (isBefore(hourStartDate, hourStartLimitDate)) {
      return res.status(400).json({ error: 'Limit date can not be greater than event date'});
    }
    
    const eventUpdated = await event.update(req.body);
    res.json(eventUpdated);    
  }

  async getEventById(req, res) {
    const event = await Evento.findOne({
      where: {
        id: req.params.id,
        creator_id: req.user.id
      }
    });

    if (!event) {
      return res.status(400).json({ status: 'Only creator can get this event' });
    }
    
    res.json(event);
  }

  async deleteEvent(req, res) {

    const event = await Evento.findOne({
      where: {
        id: req.params.id,
        creator_id: req.user.id
      }
    });

    const subscription = await Subscription.findAll({
      include: {
        model: Evento,
        as: 'evento',
        where: {
          id: event.id
        }
      }
    });

    console.log(subscription);

    if (!event) {
      return res.status(400).json({ status: 'Only creator can delete this event' });
    }

    if (subscription.length > 0) {
      subscription.map(async result => {
        await result.destroy();
      })
    }

    const result = await event.destroy();
    
    if (!result) {
      return res.status(400).json({ status: 'Error deleting event, try again' });
    }

    return res.status(200).json({ status: 'Event deleted' });
  }
}

export default new EventoController();
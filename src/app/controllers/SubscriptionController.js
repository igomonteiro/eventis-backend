import { Op } from 'sequelize';
import Evento from '../models/Evento';
import Subscription from '../models/Subscription';
import User from '../models/User';
import Notification from '../schemas/Notification';

class SubscriptionController {
  async newSubscription(req, res) {
    const event = await Evento.findOne({
      where: {
        id: req.body.event_id
      }
    });

    if (event.creator_id === req.user.id) {
      return res.status(401).json({ error: 'You can only subscribe in events that you are not a creator'});
    }

    if (event.private_event && (event.password != req.body.password)) {
      return res.status(401).json({ error: 'Incorret password'});
    }

    const subscritpionExists = await Subscription.findOne({
      where: {
        user_id: req.user.id,
        evento_id: event.id,
        canceled_at: {
          [Op.not]: null
        }
      }
    });

    const user = await User.findByPk(req.user.id);

    if (subscritpionExists) {

      let newSubscribers = event.subscribers + 1;

      if (newSubscribers == (event.max_users + 1)) {
        return res.status(401).json({ error: 'The event has reached the limit of subscribers' });
      }

      const subscription = await subscritpionExists.update({
        canceled_at: null,
      });

      await event.update({
        subscribers: newSubscribers,
      });

      await Notification.create({
        content: `${user.name} se inscreveu no seu evento "${event.title}"`,
        user: event.creator_id,
      });

      return res.json(subscription);
    }

    let newSubscribers = event.subscribers + 1;

    if (newSubscribers == (event.max_users + 1)) {
      return res.status(401).json({ error: 'The event has reached the limit of subscribers' });
    }

    const subscription = await Subscription.create({
      user_id: req.user.id,
      evento_id: event.id,
    });

    await event.update({
      subscribers: newSubscribers,
    });

    await Notification.create({
      content: `${user.name} se inscreveu no seu evento "${event.title}"`,
      user: event.creator_id,
    });

    return res.json(subscription);
  }

  async mySubscriptions(req, res) {
    const subscription = await Subscription.findAll({
      where: {
        user_id: req.user.id,
      },
      include: {
        model: Evento,
        as: 'evento',
      }
    });
    
    res.json(subscription);
  }

  async cancelSubscription(req, res) {
    const subscription = await Subscription.findOne({
      where: {
        id: req.body.id,
        user_id: req.user.id
      }
    });

    const user = await User.findOne({
      where: {
        id: req.user.id
      }
    })
    
    const event = await Evento.findOne({
      where: {
        id: subscription.evento_id,
      }
    });

    event.update({
      subscribers: event.subscribers - 1,
    });

    await subscription.update({
      canceled_at: new Date(Date.now()),
    });

    await Notification.create({
      content: `${user.name} cancelou a participação no seu evento "${event.title}"`,
      user: event.creator_id,
    });

    res.json(subscription);
  }
}

export default new SubscriptionController();
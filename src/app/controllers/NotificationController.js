import Notification from '../schemas/Notification';
import Evento from '../models/Evento';
import Subscription from '../models/Subscription';
import { isTomorrow } from 'date-fns';
import formatDate from 'date-fns/format';

class NotificationController {
  async index(req, res) {
    const notifications = await Notification.find({
      user: req.user.id,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.json(notifications);
  }

  async upcomingEventNotification(req, res) {

    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.user.id,
      },
      include: {
        model: Evento,
        as: 'evento',
        attributes: ['title', 'date']
      }
    });

    const events = subscriptions.map(subs => ({
      title: subs.evento.title,
      date: subs.evento.date,
    }));

    const upcomingEvents = events.filter(event =>
      isTomorrow(event.date)
    );

    if (upcomingEvents.length <= 0) {
      return res.status(401).json({ error: 'No notifications upcoming' });
    }

    const notifications = upcomingEvents.map(upcoming => ({
      content: `O evento ${upcoming.title} ocorrerá amanhã às ${formatDate(upcoming.date, "H:mm'h'")}`,
      user: req.user.id
    }));

    const allNotifications = await Notification.find({
      user: req.user.id,
    });

    let notificationsExists = [];

    notifications.map(noti1 => {
      allNotifications.map(noti2 => {
        if (noti1.content == noti2.content) {
          notificationsExists.push(noti1);
        }
      });
    });

    if (notificationsExists.length > 0) {
      return res.json([]);
    }

    const result = await Notification.insertMany(notifications);
      
    return res.json(result);
  }

  async update(req, res) {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    return res.json(notification);
  }
}

export default new NotificationController();
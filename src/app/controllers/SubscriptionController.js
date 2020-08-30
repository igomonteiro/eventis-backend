import Evento from '../models/Evento';
import Subscription from '../models/Subscription';

class SubscriptionController {
  async newSubscription(req, res) {
    const event = await Evento.findOne({
      where: {
        id: req.body.event_id
      }
    });

    if (event.creator_id === req.user.id) {
      return res.status(401).json({ error: 'You can only subscribe in events that you are not a creator'})
    }

    const subscription = await Subscription.create({
      user_id: req.user.id,
      evento_id: event.id,
    });

    return res.json(subscription);
  }

  async mySubscritpions(req, res) {
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

  async cancelSubscritpion(req, res) {
  }
}

export default new SubscriptionController();
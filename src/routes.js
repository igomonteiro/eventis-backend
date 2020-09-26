import { Router } from 'express';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import ensureAuthenticated from './middlewares/ensureAuthenticated';
import EventController from './app/controllers/EventController';
import SubscriptionController from './app/controllers/SubscriptionController';
import NotificationController from './app/controllers/NotificationController';

const routes = new Router();

// Sessão
routes.post('/sessions', SessionController.create);

// Users
routes.post('/users', UserController.create);
routes.get('/users', ensureAuthenticated, UserController.index);
routes.put('/users', ensureAuthenticated, UserController.update);

// Events
routes.post('/events', ensureAuthenticated, EventController.create);
routes.get('/events', ensureAuthenticated, EventController.listAllEvents);
routes.get('/myEvents', ensureAuthenticated, EventController.listAllMyEvents);
routes.get('/myEvents/:id', ensureAuthenticated, EventController.getEventById);
routes.put('/myEvents/:id', ensureAuthenticated, EventController.updateEvent);
routes.delete('/myEvents/:id', ensureAuthenticated, EventController.deleteEvent);

// Subscription
routes.get('/subscription', ensureAuthenticated, SubscriptionController.mySubscriptions);
routes.post('/subscription', ensureAuthenticated, SubscriptionController.newSubscription);
routes.put('/subscription', ensureAuthenticated, SubscriptionController.cancelSubscription);

// Notification
routes.get('/notifications', ensureAuthenticated, NotificationController.index);
routes.put('/notifications/:id', ensureAuthenticated, NotificationController.update);

export default routes;
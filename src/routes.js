import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import ensureAuthenticated from './middlewares/ensureAuthenticated';
import EventController from './app/controllers/EventController';
import SubscriptionController from './app/controllers/SubscriptionController';
import NotificationController from './app/controllers/NotificationController';
import FileController from './app/controllers/FileController';

const routes = new Router();
const upload = multer(multerConfig);

// Sessão
routes.post('/sessions', SessionController.create);

// Users
routes.post('/users', UserController.create);
routes.get('/users', ensureAuthenticated, UserController.index);
routes.put('/users', ensureAuthenticated, UserController.update);

// Events
routes.post('/events', ensureAuthenticated, EventController.create);
routes.get('/events', ensureAuthenticated, EventController.listAllEvents);
routes.get('/events/:id', ensureAuthenticated, EventController.filterById);
routes.get('/myEvents', ensureAuthenticated, EventController.listAllMyEvents);
routes.get('/myEvents/subscribers/:id', ensureAuthenticated, EventController.getAllSubscribers);
routes.get('/myEvents/:id', ensureAuthenticated, EventController.getEventById);
routes.put('/myEvents/:id', ensureAuthenticated, EventController.updateEvent);
routes.delete('/myEvents/:id', ensureAuthenticated, EventController.deleteEvent);

// Subscription
routes.get('/subscription', ensureAuthenticated, SubscriptionController.mySubscriptions);
routes.post('/subscription', ensureAuthenticated, SubscriptionController.newSubscription);
routes.put('/subscription', ensureAuthenticated, SubscriptionController.cancelSubscription);

// Notification
routes.get('/notifications', ensureAuthenticated, NotificationController.index);
routes.get('/notifications/upcoming', ensureAuthenticated, NotificationController.upcomingEventNotification);
routes.put('/notifications/:id', ensureAuthenticated, NotificationController.update);

// Files
routes.post('/files', upload.single('file'), ensureAuthenticated, FileController.create);

export default routes;
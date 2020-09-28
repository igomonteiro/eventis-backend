import Sequelize from 'sequelize';
import mongoose from 'mongoose';

import User from '../app/models/User';
import File from '../app/models/File';
import Evento from '../app/models/Evento';
import Subscription from '../app/models/Subscription';

import databaseConfig from '../config/database';

const models = [User, Evento, Subscription, File];

class Database {
  constructor() {
    this.init();
    this.mongo();
  }

  init() {
    this.connection = new Sequelize(databaseConfig)
    
    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }

  mongo() {   
    this.mongoConnection = mongoose.connect(
      'mongodb://localhost:27017/eventis',
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
  }
}

export default new Database();
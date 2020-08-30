import Sequelize, { Model } from 'sequelize';

class Evento extends Model {
  static init(sequelize) {
    super.init({
      title: Sequelize.STRING,
      description: Sequelize.STRING,
      location: Sequelize.STRING,
      max_users: Sequelize.INTEGER,
      private_event: Sequelize.BOOLEAN,
      password: Sequelize.STRING,
      date: Sequelize.DATE,
      date_limit: Sequelize.DATE,
    },
    {
      sequelize,
    });
    
    return this;
  }

  static associate(models) {
    // this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    this.belongsTo(models.User, { foreignKey: 'creator_id', as: 'creator' });
  }
}

export default Evento;
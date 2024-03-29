import Sequelize, { Model } from 'sequelize';

class Subscription extends Model {
  static init(sequelize) {
    super.init({
      canceled_at: Sequelize.DATE,
    },
    {
      sequelize,
    });
    
    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    this.belongsTo(models.Evento, { foreignKey: 'evento_id', as: 'evento' });
  }
}

export default Subscription;
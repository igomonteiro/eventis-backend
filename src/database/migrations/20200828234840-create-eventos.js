'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('eventos', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      max_users: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      private_event: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      creator_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        allowNull: false
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      date_limit: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }	
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('eventos');
  }
};

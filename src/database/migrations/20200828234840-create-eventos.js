'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('eventos', {
      id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          min: 4,
          max: 25,
        }
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          max: 225,
        }
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          min: 10,
          max: 55,
        }
      },
      max_users: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      subscribers: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      private_event: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          min: 6,
          max: 24
        }
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

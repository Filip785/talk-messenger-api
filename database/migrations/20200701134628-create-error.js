'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Errors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      errorMessage: {
        type: Sequelize.STRING
      },
      errorCode: {
        type: Sequelize.INTEGER
      },
      errorDescription: {
        type: Sequelize.STRING
      },
      errorUrl: {
        type: Sequelize.STRING
      },
      browser: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Errors');
  }
};
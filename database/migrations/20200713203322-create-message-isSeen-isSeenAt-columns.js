'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.addColumn('Messages', 'isSeen', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      }, { transaction });
      await queryInterface.addColumn('Messages', 'isSeenAt', {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      }, { transaction });

      await transaction.commit();

      return Promise.resolve();
    } catch (err) {
      if(transaction) {
        await transaction.rollback();
      }

      return Promise.reject(err);
    }
  },
  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.removeColumn('Messages', 'isSeen', { transaction });
      await queryInterface.removeColumn('Messages', 'isSeenAt', { transaction });

      await transaction.commit();

      return Promise.resolve();
    } catch (err) {
      if (transaction) {
        transaction.rollback();
      }

      return Promise.resolve(err);
    }
  }
};

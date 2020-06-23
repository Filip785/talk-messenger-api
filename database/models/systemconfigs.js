'use strict';
module.exports = (sequelize, DataTypes) => {
  const SystemConfigs = sequelize.define('SystemConfigs', {
    new_conversation_message: DataTypes.STRING
  }, {});
  SystemConfigs.associate = function(models) {
    // associations can be defined here
  };
  return SystemConfigs;
};
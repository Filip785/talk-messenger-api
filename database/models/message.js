'use strict';
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    senderId: DataTypes.INTEGER,
    receiverId: DataTypes.INTEGER,
    conversationId: DataTypes.INTEGER,
    message: DataTypes.TEXT,
    is_system: DataTypes.INTEGER
  }, {});
  Message.associate = function(models) {
    // associations can be defined here
  };
  return Message;
};
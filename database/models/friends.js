'use strict';
module.exports = (sequelize, DataTypes) => {
  const Friends = sequelize.define('Friends', {
    friend_1: DataTypes.NUMBER,
    friend_2: DataTypes.NUMBER,
    is_accepted: DataTypes.NUMBER
  }, {});
  Friends.associate = function(models) {
    // associations can be defined here
  };
  return Friends;
};
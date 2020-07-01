'use strict';
module.exports = (sequelize, DataTypes) => {
  const Error = sequelize.define('Error', {
    errorMessage: DataTypes.STRING,
    errorCode: DataTypes.NUMBER,
    errorDescription: DataTypes.STRING,
    errorUrl: DataTypes.STRING,
    browser: DataTypes.STRING
  }, {});
  Error.associate = function(models) {
    // associations can be defined here
  };
  return Error;
};
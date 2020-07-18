import { Model, DataTypes, Sequelize, HasManyOptions } from "sequelize";
import User from './User';

export default class Friend extends Model {
  public id!: number;
  public user_1!: number;
  public user_2!: number;
  public User1?: Friend;
  public User2?: Friend;
  public is_accepted!: number;
}

export function initFriendModel(sequelize: Sequelize) {
  Friend.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_1: {
      type: new DataTypes.STRING(128),
      allowNull: false
    },
    user_2: {
      type: new DataTypes.STRING(128),
      allowNull: false
    },
    is_accepted: {
      type: new DataTypes.STRING(128),
      allowNull: true
    }
  }, {
    tableName: 'Friends',
    sequelize: sequelize,
  });

  Friend.belongsTo(User, {
    as: 'User1',
    foreignKey: 'user_1'
  });

  Friend.belongsTo(User, {
    as: 'User2',
    foreignKey: 'user_2'
  });
}


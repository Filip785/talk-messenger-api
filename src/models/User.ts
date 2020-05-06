import { Model, DataTypes, Sequelize } from "sequelize";

export default class User extends Model {
  public id!: number;
  public name!: string;
  public avatar!: string;
  public email!: string; 
  public password!: string; 
  public createdAt!: string;
  public updatedAt!: string;
}

export function initUserModel(sequelize: Sequelize) {
  User.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    avatar: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    email: {
      type: new DataTypes.STRING(128),
      allowNull: true
    },
    password: {
      type: new DataTypes.STRING(128),
      allowNull: true
    }
  }, {
    tableName: 'users',
    sequelize: sequelize, // this bit is important
  });
}


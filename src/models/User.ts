import { Model, DataTypes, Sequelize, Association, HasManyGetAssociationsMixin } from "sequelize";

export default class User extends Model {
  public id!: number;
  public username!: string;
  public avatar!: string;
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
    username: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    avatar: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    password: {
      type: new DataTypes.STRING(128),
      allowNull: true
    }
  }, {
    tableName: 'users',
    sequelize: sequelize,
  });
}


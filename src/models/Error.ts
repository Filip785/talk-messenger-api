import { Model, DataTypes, Sequelize } from "sequelize";

export default class Error extends Model {
  public id!: number;
  public errorMessage!: number;
  public errorCode!: number;
  public errorDescription!: number;
  public errorUrl!: string;
  public browser!: string;
  public createdAt!: string;
  public updatedAt!: string;
}

export function initErrorModel(sequelize: Sequelize) {
  Error.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER.UNSIGNED
    },
    errorMessage: {
      type: DataTypes.STRING
    },
    errorCode: {
      type: DataTypes.INTEGER.UNSIGNED
    },
    errorDescription: {
      type: DataTypes.STRING
    },
    errorUrl: {
      type: DataTypes.STRING
    },
    browser: {
      type: DataTypes.STRING
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    tableName: 'Errors',
    sequelize: sequelize,
  });
}


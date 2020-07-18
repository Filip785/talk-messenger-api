import { Model, DataTypes, Sequelize, HasOneGetAssociationMixin } from "sequelize";
import User from './User';
import Friend from './Friend';

export default class Message extends Model {
  public id!: number;
  public senderId!: number;
  public receiverId!: number;
  public conversationId!: number;
  public message!: string;
  public isSeen!: number;
  public isSeenAt!: Date | string;
  public isSystem!: number;
  public createdAt!: string;
  public updatedAt!: string;
  public createdAtTime!: string;

  public getSender!: HasOneGetAssociationMixin<Friend>;
}

export function initMessageModel(sequelize: Sequelize) {
  Message.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    senderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    receiverId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    conversationId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isSeen: {
      type: DataTypes.INTEGER.UNSIGNED,
    },
    isSeenAt: {
      type: 'TIMESTAMP',
    },
    isSystem: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    }
  }, {
    tableName: 'Messages',
    sequelize: sequelize,
  });

  Message.belongsTo(User, {
    as: 'Sender',
    foreignKey: 'senderId'
  });

  Message.belongsTo(User, {
    as: 'Receiver',
    foreignKey: 'receiverId'
  });

  Message.belongsTo(Friend, {
    as: 'Friend',
    foreignKey: 'conversationId'
  });
}
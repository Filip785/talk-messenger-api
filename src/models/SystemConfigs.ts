import { Model, DataTypes, Sequelize } from "sequelize";

export default class SystemConfigs extends Model {
  public id!: number;
  public config_name!: string;
  public config_value!: string;
  public createdAt!: string;
  public updatedAt!: string;

  static async getNewConversationMessage(): Promise<string> {
    const item: SystemConfigs | null = await SystemConfigs.findOne({ where: { config_name: 'new_conversation_message' } });
    
    return item!.config_value;
  }
}

export function initSystemConfigs(sequelize: Sequelize) {
  SystemConfigs.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    config_name: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    config_value: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    }
  }, {
    tableName: 'SystemConfigs',
    sequelize: sequelize,
  });
}


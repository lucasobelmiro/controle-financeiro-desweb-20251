import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
export class Category extends Model {
  public id!: number;
  public name!: string;
  public isGlobal!: boolean;
  public userId!: number | null;
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isGlobal: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_global",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "userId",
    },
  },
  {
    sequelize,
    tableName: "categories",
    timestamps: false,
  }
);

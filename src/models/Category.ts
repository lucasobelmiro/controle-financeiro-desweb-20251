import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

interface CategoryAttributes {
  id: number;
  name: string;
  type: "entrada" | "saida";
}

interface CategoryCreationAttributes extends Omit<CategoryAttributes, "id"> {}

export class Category
  extends Model<CategoryAttributes, CategoryCreationAttributes>
  implements CategoryAttributes
{
  public id!: number;
  public name!: string;
  public type!: "entrada" | "saida";
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
    type: {
      type: DataTypes.ENUM("entrada", "saida"),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "categories",
    timestamps: false,
  }
);

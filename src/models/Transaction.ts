import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/database";
import { User } from "./User";
import { Category } from "./Category";

interface TransactionAttributes {
  id: number;
  userId: number;
  categoryId: number;
  valor: number;
  descricao: string;
  tipo: "entrada" | "saida";
  data: Date;
}

interface TransactionCreationAttributes
  extends Optional<TransactionAttributes, "id"> {}

export class Transaction
  extends Model<TransactionAttributes, TransactionCreationAttributes>
  implements TransactionAttributes
{
  public id!: number;
  public userId!: number;
  public categoryId!: number;
  public valor!: number;
  public descricao!: string;
  public tipo!: "entrada" | "saida";
  public data!: Date;
}

Transaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    valor: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    descricao: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tipo: {
      type: DataTypes.ENUM("entrada", "saida"),
      allowNull: false,
    },
    data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "transactions",
    timestamps: false,
  }
);

// Relacionamentos
Transaction.belongsTo(User, { foreignKey: "userId" });
Transaction.belongsTo(Category, { foreignKey: "categoryId" });
Category.hasMany(Transaction, { foreignKey: "categoryId" });

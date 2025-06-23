import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';
import User from './User';
import Product from './Product';

interface ReviewAttributes {
  sn: number;
  id: string;
  UserId: string;
  ProductId: string;
  rating: number;
  comment: string;
}

interface ReviewInstance extends Model<ReviewAttributes>, ReviewAttributes {}

const Review = sequelize.define<ReviewInstance>(
  'Review',
  {
    sn: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
    //   unique: true,
    },
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    UserId: {
      type: DataTypes.UUID,
      allowNull: false,
    //   references: { model: 'Users', key: 'id' },
    },
    ProductId: {
      type: DataTypes.UUID,
      allowNull: false,
    //   references: { model: 'Products', key: 'id' },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  { timestamps: true }
);

Review.belongsTo(User);
Review.belongsTo(Product);


export default Review;
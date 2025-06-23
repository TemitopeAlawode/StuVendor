import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';
import User from './User';
import ShoppingCart from './ShoppingCart';

interface PaymentAttributes {
  sn: number;
  id: string;
  UserId: string;
  ShoppingCartId: string;
  amount: number;
  paymentStatus: string;
  transactionId: string;
  paymentTimestamp: Date;
}

interface PaymentInstance extends Model<PaymentAttributes>, PaymentAttributes {}

const Payment = sequelize.define<PaymentInstance>(
  'Payment',
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
      references: { model: 'Users', key: 'id' },
    },
    ShoppingCartId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'ShoppingCart', key: 'id' },
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    // Unique ID from the payment gateway (e.g., Paystack).
    transactionId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paymentTimestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  { 
    timestamps: true 
  }
);


Payment.belongsTo(User);
Payment.belongsTo(ShoppingCart);


export default Payment;
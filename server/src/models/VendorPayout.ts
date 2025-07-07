import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';
import Vendor from './Vendor';

interface VendorPayoutAttributes {
  sn?: number;
  id?: string;
  VendorId: string;
  transactionId?: string; // For order-related payouts
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  transferReference?: string;
  type: 'order_split' | 'withdrawal'; // Differentiate between split and withdrawal
  createdAt?: Date;
}

interface VendorPayoutInstance extends Model<VendorPayoutAttributes>, VendorPayoutAttributes {}

const VendorPayout = sequelize.define<VendorPayoutInstance>(
  'VendorPayout',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    VendorId: {
      type: DataTypes.UUID,
      allowNull: false,
    //   references: { model: 'Vendors', key: 'id' },
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    transferReference: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('order_split', 'withdrawal'),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
  }
);

VendorPayout.belongsTo(Vendor);

export default VendorPayout;
import { DataTypes, Model, ModelStatic } from 'sequelize';
import sequelize from '../db';
import User from './User';
import Product from './Product';
import Vendor from './Vendor';
import Order from './Order';

interface OrderProductsAttributes {
  sn?: string;
  id: string;
  UserId: string;
  ProductId: string;
  VendorId: string;
  OrderId: string;
  quantity: number;
  price: number;
}

interface OrderProductsInstance extends Model<OrderProductsAttributes>, OrderProductsAttributes {}


const OrderProducts = sequelize.define<OrderProductsInstance>(
  'OrderProducts',
  {
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
    ProductId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Products', key: 'id' },
    },
    VendorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Vendors', key: 'id' },
    },
    OrderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Orders', key: 'id' },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);


  OrderProducts.belongsTo(Order);
  OrderProducts.belongsTo(Product);
  OrderProducts.belongsTo(Vendor);
  OrderProducts.belongsTo(User);


export default OrderProducts;
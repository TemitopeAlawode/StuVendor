import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';
import User from './User';
import Product from './Product';
import Vendor from './Vendor';
import Order from './Order';

interface OrderHistoryAttributes {
    sn: number;
    id: string;
    UserId: string;
    ProductId: string;
    VendorId: string;
    orderId: string;
    quantity: number;
    totalPrice: number;
    orderStatus: string;
    orderDate: Date;
}

interface OrderHistoryInstance extends Model<OrderHistoryAttributes>, OrderHistoryAttributes { }

const OrderHistory = sequelize.define<OrderHistoryInstance>(
    'OrderHistory',
    {
        sn: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            unique: true,
        },
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        UserId: {
            type: DataTypes.UUID,
            allowNull: false,
            // references: { model: 'Users', key: 'id' },
        },
        ProductId: {
            type: DataTypes.UUID,
            allowNull: false,
            // references: { model: 'Products', key: 'id' },
        },
        VendorId: {
            type: DataTypes.UUID,
            allowNull: false,
            // references: { model: 'Vendors', key: 'id' },
        },
        orderId: {
            type: DataTypes.UUID,
            allowNull: false,
        //   references: { model: 'Orders', key: 'id' },
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        totalPrice: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        orderStatus: {
            type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
            allowNull: false,
            defaultValue: 'pending',
        },
        orderDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        timestamps: true
    }
);

OrderHistory.belongsTo(User);
OrderHistory.belongsTo(Product);
OrderHistory.belongsTo(Vendor);
OrderHistory.belongsTo(Order);

export default OrderHistory;
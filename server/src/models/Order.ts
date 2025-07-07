import { DataTypes, Model, ModelStatic } from 'sequelize';
import sequelize from '../db';
import User from './User';
import OrderHistory from './OrderHistory';
import OrderProducts from './OrderProducts';


interface OrderAttributes {
    sn?: number;
    id?: string;
    UserId: string;
    totalAmount: number;
    shippingAddress: string;
    transactionId: string;
    orderStatus: string;
    orderDate: Date;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
}

interface OrderInstance extends Model<OrderAttributes>, OrderAttributes {
    User: any;
    OrderProducts: any;
}

interface Models {
    OrderHistory: ModelStatic<Model>;
    OrderProducts: ModelStatic<Model>;
}

const Order = sequelize.define<OrderInstance>(
    'Order',
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
        totalAmount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        shippingAddress: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        transactionId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
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
        customerName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        customerEmail: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        customerPhone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        timestamps: true,
    }
);

(Order as typeof Order & { associate?: (models: Models) => void }).associate = (models: Models) => {
    Order.hasMany(models.OrderHistory);
    Order.hasMany(models.OrderProducts);
};


Order.belongsTo(User);


export default Order;
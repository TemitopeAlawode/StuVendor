import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';
import User from './User';
import Product from './Product';

interface ShoppingCartAttributes {
    sn?: number;
    id?: string;
    UserId: string;
    ProductId: string;
    quantity: number;
    totalPrice: number;
}

interface ShoppingCartInstance extends Model<ShoppingCartAttributes>, ShoppingCartAttributes {
    Product: any;
}

const ShoppingCart = sequelize.define<ShoppingCartInstance>(
    'ShoppingCart',
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
            //   references: { model: 'Users', key: 'id' },
        },
        ProductId: {
            type: DataTypes.UUID,
            allowNull: false,
            //   references: { model: 'Products', key: 'id' },
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        totalPrice: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
    },
    { 
        timestamps: true 
    }
);

ShoppingCart.belongsTo(User);
ShoppingCart.belongsTo(Product);

export default ShoppingCart;
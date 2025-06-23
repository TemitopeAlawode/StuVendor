import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';
import User from './User';
import Product from './Product';
import Vendor from './Vendor';

interface ViewedProductAttributes {
    sn?: number;
    id?: string;
    UserId: string;
    ProductId: string;
    VendorId: string;
    viewTimestamp: Date;
}

interface ViewedProductInstance extends Model<ViewedProductAttributes>, ViewedProductAttributes { }

const ViewedProduct = sequelize.define<ViewedProductInstance>(
    'ViewedProduct',
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
        viewTimestamp: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
          },
    },
    {
        timestamps: true
    }
);


ViewedProduct.belongsTo(User);
ViewedProduct.belongsTo(Product);
ViewedProduct.belongsTo(Vendor);


export default ViewedProduct;
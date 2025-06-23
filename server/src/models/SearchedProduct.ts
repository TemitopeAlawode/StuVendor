import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';
import User from './User';
import Product from './Product';
import Vendor from './Vendor';

interface SearchedProductAttributes {
    sn?: number;
    id?: string;
    UserId: string;
    searchQuery: string;
    ProductId?: string | null;
    VendorId?: string | null;
    searchTimestamp: Date;
}

interface SearchedProductInstance extends Model<SearchedProductAttributes>, SearchedProductAttributes { }

const SearchedProduct = sequelize.define<SearchedProductInstance>(
    'SearchedProduct',
    {
        sn: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            unique: true,
        },
        UserId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'Users', key: 'id' },
        },
        searchQuery: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ProductId: {
            type: DataTypes.UUID,
            allowNull: true,
            // references: { model: 'Products', key: 'id' },
        },
        VendorId: {
            type: DataTypes.UUID,
            allowNull: true,
            // references: { model: 'Vendors', key: 'id' },
        },
        searchTimestamp: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        timestamps: true
    }
);

SearchedProduct.belongsTo(User);
SearchedProduct.belongsTo(Product);
SearchedProduct.belongsTo(Vendor);


export default SearchedProduct;
import { DataTypes, ModelStatic, Model } from 'sequelize';
import sequelize from '../db';
import Vendor from './Vendor';
import Category from './Category';

// Defining an interface for type checking
interface ProductAttributes {
  sn?: number
  id?: string // UUID is a string
  name: string
  description: string // this should probably be optional
  price: number
  VendorId?: string
  CategoryId: string
  stock: number
  productImage: string
}

// Sequelize model instance type
interface ProductInstance extends Model<ProductAttributes>, ProductAttributes {
    Category: any;
}


interface Models {
  ViewedProduct: ModelStatic<Model>; // ViewedProduct model for tracking user views.
  SearchedProduct: ModelStatic<Model>; // SearchedProduct model for tracking user searches.
  LikedProduct: ModelStatic<Model>;
  ShoppingCart: ModelStatic<Model>; // ShoppingCart model for user cart data.
  Payment: ModelStatic<Model>; // Payment model for user payment records.
}


const Product = sequelize.define<ProductInstance>(
  'Product',
  {
    sn: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      unique: true
    },
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // price: {
    //   type: DataTypes.FLOAT,
    //   allowNull: false,
    // },

    price: {
  type: DataTypes.DECIMAL(10, 2), // 10 digits total, 2 after decimal (e.g., up to 99,999,999.99)
  allowNull: false,
  validate: {
    isDecimal: {
      msg: "Price must be a valid decimal number.",
    },
    min: {
      args: [0],
      msg: "Price cannot be negative.",
    },
    max: {
      args: [99999999.99], // Matches DECIMAL(10, 2) max value
      msg: "Price is too large (max 99,999,999.99).",
    },
  },
},

    VendorId: {
      type: DataTypes.UUID,
      allowNull: false,
      // references: { model: 'Vendors', key: 'id' }
    },
    CategoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      // references: { model: 'Categories', key: 'id' }
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    productImage: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    timestamps: true,
  }
);


//   Product.associate = (models: Models) => {
//     Product.hasMany(models.Product);
//   }

(Product as typeof Product & { associate?: (models: Models) => void }).associate = (models: Models) => {
  Product.hasMany(models.ViewedProduct);
  Product.hasMany(models.SearchedProduct);
  Product.hasMany(models.LikedProduct);
};

Product.belongsTo(Vendor);
Product.belongsTo(Category);

export default Product;
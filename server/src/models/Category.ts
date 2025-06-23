import { DataTypes, Model, ModelStatic } from "sequelize";
import sequelize from "../db";
// import Product from "./Product";

// Define the attributes
interface CategoryAttributes {
  sn?: number;
  id?: string;
  name: string;
}

// Define the instance type
interface CategoryInstance extends Model<CategoryAttributes>, CategoryAttributes { }

// Define Models object for associate
// ModelStatic: a type representing a Sequelize model constructor 
// (the return type of sequelize.define).
interface Models {
  Product: ModelStatic<Model>;
}


// Define the base model and cast after defining
const Category = sequelize.define<CategoryInstance>(
  "Category",
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
  },
  {
    timestamps: true,
  }
);

// Extend the model with `associate`
(Category as typeof Category & { associate?: (models: Models) => void }).associate = (models: Models) => {
  Category.hasMany(models.Product);
};

// (Category as any).associate = (models: Models) => {
//   Category.hasMany(models.Product);
// };

export default Category;






// import { DataTypes, Model } from'sequelize';
// import sequelize from '../db';
// import Product from './Product';

// // Defining an interface for type checking
// interface CategoryAttributes {
//     id: string // UUID is a string
//     name: string
// }

// // Sequelize model instance type
// interface CategoryModel extends Model<CategoryAttributes>, CategoryAttributes {}

// const Category = sequelize.define<CategoryModel>(
//     'Category', {
//   // Defining the fields/columns
//   id: {
//     type: DataTypes.UUID,
//     defaultValue: DataTypes.UUIDV4, // Or DataTypes.UUIDV1
//     primaryKey: true,
//   },
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
// }, {
//   timestamps: true,
// });

// // // Defining an interface for the models
// interface Models{
//     Product: typeof Product
// }

//   // specifying that Category has an associate or a relationship
// Category.associate = (models: Models) => {
//     Category.hasMany(models.Product);
//   };

// // Category.hasMany(Product);

//   export default Category;

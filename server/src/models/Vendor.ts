import { DataTypes, ModelStatic, Model } from 'sequelize';
import sequelize from '../db';
import User from './User';

// Define the attributes
interface VendorAttributes {
  sn?: number;
  id?: string;
  businessName: string;
  address?: string;
  phoneNumber?: string;
  description?: string;
  bankDetails?: string;
  UserId: string;
  profilePicture: string;
  bankCode: string
  bankAccountNumber: string
  bankAccountName: string
}

//  Define the instance type
interface VendorInstance extends Model<VendorAttributes>, VendorAttributes { }

// Define Models object for associate
// ModelStatic: a type representing a Sequelize model constructor 
// (the return type of sequelize.define).
interface Models {
  Product: ModelStatic<Model>;
  ViewedProduct: ModelStatic<Model>; // ViewedProduct model for tracking user views.
  SearchedProduct: ModelStatic<Model>; // SearchedProduct model for tracking user searches.
  LikedProduct: ModelStatic<Model>;
}


const Vendor = sequelize.define<VendorInstance>(
  'Vendor',
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
    businessName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      // validate: {
      //   is: /^\+?[1-9]\d{1,14}$/, // Basic phone number validation (E.164 format)
      // },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // bankDetails: {
    //   type: DataTypes.JSON, // E.g., { accountNumber: "1234567890", bankCode: "044" }
    //   allowNull: true,
    // },

    bankCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bankAccountNumber: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      len: [10, 10],
      isNumeric: { msg: "Account number must contain only digits." },
    },
  },
  bankAccountName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: "Account name is required." },
    },
  },

    UserId: {
      type: DataTypes.UUID,
      allowNull: false,
      // references: { model: 'Users', key: 'id' },
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true
      // allowNull: false
    }
  },
  {
    timestamps: true,
  }
);


// Extend the model with `associate`
(Vendor as typeof Vendor & { associate?: (models: Models) => void }).associate = (models: Models) => {
  Vendor.hasMany(models.Product);
  User.hasMany(models.ViewedProduct);
  User.hasMany(models.SearchedProduct);
  User.hasMany(models.LikedProduct);
};

Vendor.belongsTo(User);

export default Vendor;











// import { DataTypes, ModelStatic, Model } from 'sequelize';
// import sequelize from '../db';
// import User from './User';

// interface Models {
//   Product: ModelStatic<Model>;
// }

// interface VendorModel extends ModelStatic<Model> {
//   associate?: (models: Models) => void;
// }

// const Vendor: VendorModel = sequelize.define(
//   'Vendor',
//   {
//     id: {
//       type: DataTypes.UUID,
//       defaultValue: DataTypes.UUIDV4,
//       primaryKey: true,
//     },
//     businessName: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     address: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     phoneNumber: {
//       type: DataTypes.STRING,
//       allowNull: true,
//       validate: {
//         is: /^\+?[1-9]\d{1,14}$/, // Basic phone number validation (E.164 format)
//       },
//     },
//     description: {
//       type: DataTypes.TEXT,
//       allowNull: true,
//     },
//     bankDetails: {
//       type: DataTypes.JSON, // E.g., { accountNumber: "1234567890", bankCode: "044" }
//       allowNull: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// Vendor.associate = (models: Models) => {
//   Vendor.hasMany(models.Product);
// };

// Vendor.belongsTo(User);

// export default Vendor;
















// import { DataTypes } from'sequelize';
// import sequelize from '../db';
// import User from './User';

// const Vendor = sequelize.define(
//   'Vendor',
//   {
//     id: {
//       type: DataTypes.UUID,
//       defaultValue: DataTypes.UUIDV4,
//       primaryKey: true,
//     },
//     businessName: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     address: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     phoneNumber: {
//       type: DataTypes.STRING,
//       allowNull: true,
//       validate: {
//         is: /^\+?[1-9]\d{1,14}$/, // Basic phone number validation (E.164 format)
//       },
//     },
//     description: {
//       type: DataTypes.TEXT,
//       allowNull: true,
//     },
//     bankDetails: {
//       type: DataTypes.JSON, // E.g., { accountNumber: "1234567890", bankCode: "044" }
//       allowNull: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Defining an interface for the models
// interface Models{
//   Product: any
// }

// Vendor.associate = (models: Models) => {
//   Vendor.hasMany(models.Product);
// }
// Vendor.belongsTo(User);

// export default Vendor;

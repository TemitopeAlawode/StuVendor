import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';
import User from './User';

interface PasswordResetAttributes {
  id?: string;
  UserId: string;
  token: string;
  expiresAt: Date;
}

interface PasswordResetInstance extends Model<PasswordResetAttributes>, PasswordResetAttributes { }

const PasswordReset = sequelize.define<PasswordResetInstance>(
  'PasswordReset',
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
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    updatedAt: false  //disables only updatedAt
  },
);

PasswordReset.belongsTo(User);


export default PasswordReset;
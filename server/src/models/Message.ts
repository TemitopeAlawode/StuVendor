import { DataTypes, Model } from "sequelize";
import sequelize from "../db";
import User from "./User";

interface MessageAttributes {
    sn?: number;
    id?: string;
    senderId: string;
    receiverId: string;
    content: string;
    isRead: boolean;
}

interface MessageInstance extends Model<MessageAttributes>, MessageAttributes {}

const Message = sequelize.define<MessageInstance>(
    "Message",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        senderId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: "Users", key: "id" },
        },
        receiverId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: "Users", key: "id" },
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        timestamps: true,
    }
);

Message.belongsTo(User, { foreignKey: "senderId", as: "Sender" });
Message.belongsTo(User, { foreignKey: "receiverId", as: "Receiver" });

export default Message;
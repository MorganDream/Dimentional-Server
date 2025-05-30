import { Model, DataTypes, BelongsToManyAddAssociationsMixin, Association, BelongsToManySetAssociationsMixin } from "sequelize";
import { sequelize } from "../basic";
import { User } from "./user";

export class Notification extends Model {
    public id!: number;
    public read!: boolean;
    public from!: string;
    public commentId!: number;
    public likeId!: number;
    public fanLikeId!: number;
    public yopaPositionId: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public addToNotifyUsers!: BelongsToManyAddAssociationsMixin<User, string>;
    public setToNotifyUsers!: BelongsToManySetAssociationsMixin<User, string>;

    public readonly toNotifyUsers?: User[];
    public static associations: {
        toNotifyUsers: Association<Notification, User>;
    };
}

export const initNotification = function() {
    Notification.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        read: {
            type: DataTypes.BOOLEAN,
        },
        from: {
            type: new DataTypes.STRING(200),
            allowNull: false
        },
        commentId: {
            type: DataTypes.INTEGER.UNSIGNED
        },
        likeId: {
            type: DataTypes.INTEGER.UNSIGNED
        },
        fanLikeId: {
            type: DataTypes.INTEGER.UNSIGNED
        },
        yopaPositionId: {
            type: DataTypes.INTEGER.UNSIGNED
        }
    }, {
        sequelize,
        tableName: 'notification',
    });
}
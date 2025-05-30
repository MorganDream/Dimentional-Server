import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../basic";

export class UserNotification extends Model {
    public notificationId!: number;
    public read!: boolean;
}
export function initUserNotification() {
    UserNotification.init({
        read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, { sequelize, tableName: 'userNotification', });
}
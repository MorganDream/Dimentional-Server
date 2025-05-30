import { Model, DataTypes } from "sequelize";
import { sequelize } from "../basic";

export class Role extends Model {
    public id!: number;
    public name!: string;
    public openId!: string;
}

export const initRole = function() {
    Role.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: new DataTypes.STRING(50),
        }
    }, {
        sequelize,
        tableName: 'role',
    });
}
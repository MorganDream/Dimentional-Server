import { Model, DataTypes } from "sequelize";
import { sequelize } from "../basic";

export class Location extends Model {
    public id!: number;
    public contry!: string;
    public province!: string;
    public city!: string;
  
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export const initLocation = function() {
    Location.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        country: {
            type: new DataTypes.STRING(10),
        },
        province: {
            type: new DataTypes.STRING(10),
        },
        city: {
            type: new DataTypes.STRING(10),
        }
    }, {
        sequelize,
        tableName: 'location',
    })
}
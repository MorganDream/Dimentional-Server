import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../basic";

export class Like extends Model {
    public id!: number;
    public feedId!: number;
    public yopaId!: number;
    public followOpenId!: string;
    public openId!: string;
  
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export const initLike = function() {
    Like.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        }
    }, {
        sequelize,
        tableName: 'like',
    });
}
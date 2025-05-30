import { Model, DataTypes, Sequelize, Association, HasManyGetAssociationsMixin, BelongsToManyGetAssociationsMixin, BelongsToGetAssociationMixin, BelongsToSetAssociationMixin } from "sequelize";
import { sequelize } from "../basic";
import { User } from "./user";
import { Yopa } from "./yopa";

export type YopaPositionType = 'COSER' | 'LOER' | 'JKER' | 'HANFUER'
    | 'PHOTOGRAPHER' | 'MAKEUPER' | 'POSTPROCESSER' | 'HAIRMAKER' | 'REARSERVICE';

export class YopaPosition extends Model {
    public id!: number;
    public type!: YopaPositionType;
    public yopaId!: number;
    public request!: string;
    public name!: string;
    public settledOpenId!: string;
  
    public readonly createdAt!: Date;
    public updatedAt!: Date;

    public getApplicants!: BelongsToManyGetAssociationsMixin<User>;

    public getYopa!: BelongsToGetAssociationMixin<Yopa>;

    public setSettledUser!: BelongsToSetAssociationMixin<User, string>;

    public readonly yopa?: Yopa;
    public static associations: {
        applicants: Association<User, YopaPosition>;
        yopa: Association<Yopa, YopaPosition>;
        settledUser: Association<User, YopaPosition>;
    };
}

export const initYopaPosition = function() {
    YopaPosition.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        type: {
            type: DataTypes.ENUM,
            values: ['COSER', 'LOER', 'JKER', 'HANFUER',
                'PHOTOGRAPHER', 'MAKEUPER', 'POSTPROCESSER', 'HAIRMAKER', 'REARSERVICE']
        },
        request: {
            type: new DataTypes.STRING(1000),
            allowNull: true
        },
        name: {
            type: new DataTypes.STRING(100),
            allowNull: true
        }
    }, {
        sequelize,
        tableName: 'yopaPosition',
    });
}
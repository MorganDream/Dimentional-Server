import { Model, DataTypes, Association, HasManyGetAssociationsMixin, HasManyCreateAssociationMixin, HasManyRemoveAssociationsMixin, BelongsToManyGetAssociationsMixin, BelongsToManyCountAssociationsMixin, BelongsToManyHasAssociationsMixin } from "sequelize";
import { sequelize } from '../basic';
import { Comment } from "./comment";
import { YopaPosition } from "./yopa-position";
import { User } from "./user";

export type YOPA_CATEGORY = 'LONG_TERM_SEEK'
                        | 'COSPLAY_PORTRAY' | 'JK_PORTRAY' | 'HANFU_PORTRAY'
                        | 'LOLITA_PORTRAY' | 'COSPLAY_FILM' | 'LOLITA_PARTY' | 'OTHER';

export type PRICE_MODEL = 'HUMIAN' | 'CHARGE' | 'PAY' | 'NEGOTIATE';

export class Yopa extends Model {
    public id!: number;
    public ownerId!: string;
    public category!: YOPA_CATEGORY;

    public title!: string;
    public text!: string;
    public images!: string;
    public start!: Date;
    public end!: Date;
    public location!: string;
    public area!: string;
    public priceModel!: PRICE_MODEL;
    public price!: number;
    public tags!: string;

    public locked!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public getComments: HasManyGetAssociationsMixin<Comment>;
    public createComment: HasManyCreateAssociationMixin<Comment>;

    public getPositions: HasManyGetAssociationsMixin<YopaPosition>;
    public createPosition: HasManyCreateAssociationMixin<YopaPosition>;
    public removePositions: HasManyRemoveAssociationsMixin<YopaPosition, number>;

    public getFans!: BelongsToManyGetAssociationsMixin<User>;
    public countFans!: BelongsToManyCountAssociationsMixin;
    public hasFan!: BelongsToManyHasAssociationsMixin<User, string>;

    public readonly positions?: Array<YopaPosition>;

    public readonly fans?: Array<User>;
    public static associations: {
        owner: Association<User, Yopa>;
        comments: Association<Yopa, Comment>;
        positions: Association<Yopa, YopaPosition>;
        fans: Association<Yopa, User>;
    };
}

export const initYopa = function() {
    Yopa.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        category: {
            type: DataTypes.ENUM,
            values: ['LONG_TERM_SEEK',
             'COSPLAY_PORTRAY', 'JK_PORTRAY', 'HANFU_PORTRAY',
             'LOLITA_PORTRAY', 'COSPLAY_FILM', 'LOLITA_PARTY', 'OTHER']
        },
        title: {
            type: new DataTypes.STRING(100)
        },
        text: {
            type: new DataTypes.STRING(500)
        },
        start: {
            type: DataTypes.DATE
        },
        end: {
            type: DataTypes.DATE
        },
        location: {
            type: new DataTypes.STRING(100)
        },
        area: {
            type: new DataTypes.STRING(30)
        },
        priceModel: {
            type: DataTypes.ENUM,
            values: ['HUMIAN', 'CHARGE', 'PAY', 'NEGOTIATE']
        },
        price: {
            type: DataTypes.INTEGER.UNSIGNED
        },
        tags: {
            type: new DataTypes.STRING(50)
        },
        images: {
            type: new DataTypes.STRING(3000)
        },
        locked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        sequelize,
        tableName: 'yopa',
    });
}
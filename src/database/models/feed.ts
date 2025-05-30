import { Model, DataTypes, Association, HasManyGetAssociationsMixin, HasManyAddAssociationMixin, HasManyHasAssociationMixin, HasManyCountAssociationsMixin, HasManyCreateAssociationMixin, BelongsToManyCountAssociationsMixin, BelongsToManyGetAssociationsMixin, BelongsToGetAssociationMixin } from "sequelize";
import { sequelize } from "../basic";
import { Comment } from "./comment";
import { User } from "./user";

export class Feed extends Model {
    public id!: number;
    public ownerId!: string;
    public text!: string;
    public tags!: string;
    public images!: string;

    public seen!: number;
    public likes!: number; 

    public getComments!: HasManyGetAssociationsMixin<Comment>;
    public countComments!: HasManyCountAssociationsMixin;
    public createComment!: HasManyCreateAssociationMixin<Comment>;

    public getFans!: BelongsToManyGetAssociationsMixin<User>;
    public countFans!: BelongsToManyCountAssociationsMixin;

    public getOwner!: BelongsToGetAssociationMixin<User>;
  
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public readonly comments?: Comment[];
    public readonly fans?: User[];
    public readonly owner?: User;
    public static associations: {
        comments: Association<Feed, Comment>;
        owner: Association<User, Feed>;
        fans: Association<Feed, User>;
    };
}

export const initFeed = function() {
    Feed.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        text: {
          type: new DataTypes.STRING(1000),
          allowNull: true,
        },
        tags: {
            type: new DataTypes.STRING(500),
            allowNull: true,
        },
        seen: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
        images: {
            type: new DataTypes.STRING(5000),
            allowNull: true,
        },
        likes: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        }
    }, {
        sequelize,
        tableName: 'feed',
    });
}
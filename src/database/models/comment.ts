import { Model, DataTypes, Association, HasManyGetAssociationsMixin, HasManyCountAssociationsMixin, HasManyCreateAssociationMixin, BelongsToGetAssociationMixin } from "sequelize";
import { sequelize } from "../basic";
import { User } from "./user";
import { Feed } from "./feed";
import { Yopa } from "./yopa";

export class Comment extends Model {
    public id!: number;
    public fromOpenId!: string;
    public feedId!: number;
    public yopaId!: number;
    
    public text!: string;  
    public replyToOpenId!: string;
    public parentId?: number;
    public image?: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public getComments!: HasManyGetAssociationsMixin<Comment>;
    public countComments!: HasManyCountAssociationsMixin;
    public createComment!: HasManyCreateAssociationMixin<Comment>;

    public getParentComment!: BelongsToGetAssociationMixin<Comment>;

    public getOwner!: BelongsToGetAssociationMixin<User>;

    public getFeed!: BelongsToGetAssociationMixin<Feed>;

    public getYopa!: BelongsToGetAssociationMixin<Yopa>;

    public comments?: Comment[];
    public owner?: User;
    public parentComment?: Comment;
    public yopa?: Yopa;
    public static associations: {
        comments: Association<Comment, Comment>;
        owner: Association<User, Comment>;
        parentComment: Association<Comment, Comment>;
        feed: Association<Feed, Comment>;
        yopa: Association<Yopa, Comment>
    };
}
    

export const initComment = function() {
    Comment.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        text: {
          type: new DataTypes.STRING(300),
          allowNull: true,
        },
        image: {
            type: new DataTypes.STRING(300),
            allowNull: true,
        },
        replyToOpenId: {
            type: new DataTypes.STRING(200),
            allowNull: true,
        }
    }, {
        sequelize,
        tableName: 'comment',
    });
}
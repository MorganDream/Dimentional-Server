import { Model, HasManyGetAssociationsMixin, HasManyAddAssociationMixin, HasManyHasAssociationMixin, HasManyCountAssociationsMixin, HasManyCreateAssociationMixin, Association, DataTypes, BelongsToManyHasAssociationMixin, BelongsToManyAddAssociationMixin, BelongsToManyRemoveAssociationMixin, BelongsToManyGetAssociationsMixin, BelongsToManyAddAssociationsMixin, BelongsToManyCreateAssociationMixin, BelongsToManyRemoveAssociationsMixin, HasManyRemoveAssociationsMixin, HasOneGetAssociationMixin, HasOneSetAssociationMixin, HasOneCreateAssociationMixin, HasManyRemoveAssociationMixin, BelongsToMany, BelongsToManySetAssociationsMixin } from 'sequelize';
import { Feed } from "./feed";
import { Location } from './location';
import { sequelize } from '../basic';
import { Yopa } from './yopa';
import { Comment } from './comment';
import { Role } from './role';
import { YopaPosition } from './yopa-position';
import { Notification } from './notification';
import { Coin } from './coin';

export class User extends Model {
    public openId!: string;
    public name!: string;
    public gender!: number;
    public avatar!: string;
    public introduction!: string;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public getLocation!: HasOneGetAssociationMixin<Location>;
    public createLocation!: HasOneCreateAssociationMixin<Location>;
    public setLocation!: HasOneSetAssociationMixin<Location, number>;

    // Since TS cannot determine model association at compile time
    // we have to declare them here purely virtually
    // these will not exist until `Model.init` was called.
    
    public getFeeds!: HasManyGetAssociationsMixin<Feed>; // Note the null assertions!
    public addFeed!: HasManyAddAssociationMixin<Feed, string>;
    // public hasFeed!: HasManyHasAssociationMixin<Feed, number>;
    // public countFeed!: HasManyCountAssociationsMixin;
    // public createFeed!: HasManyCreateAssociationMixin<Feed>;

    public getYopas!: HasManyGetAssociationsMixin<Yopa>; // Note the null assertions!
    public createYopa!: HasManyCreateAssociationMixin<Yopa>;
    public hasYopa!: HasManyHasAssociationMixin<Yopa, number>;

    public hasFollowedUser!: BelongsToManyHasAssociationMixin<User, string>;
    public hasFan!: BelongsToManyHasAssociationMixin<User, string>;
    public getFollowedUsers!: BelongsToManyGetAssociationsMixin<User>;
    public getFans!: BelongsToManyGetAssociationsMixin<User>;
    public addFollowedUser!: BelongsToManyAddAssociationMixin<User, string>;
    public removeFollowedUser!: BelongsToManyRemoveAssociationMixin<User, string>;

    public getLikedFeeds!: BelongsToManyGetAssociationsMixin<Feed>;
    public hasLikedFeeds!: BelongsToManyHasAssociationMixin<Feed, number>;
    public addLikedFeed!: BelongsToManyAddAssociationMixin<Feed, number>;
    public removeLikedFeed!: BelongsToManyRemoveAssociationMixin<Feed, number>;

    public getLikedYopas!: BelongsToManyGetAssociationsMixin<Yopa>;
    public hasLikedYopas!: BelongsToManyHasAssociationMixin<Yopa, number>;
    public addLikedYopa!: BelongsToManyAddAssociationMixin<Yopa, number>;
    public removeLikedYopa!: BelongsToManyRemoveAssociationMixin<Yopa, number>;

    public getRoles!: BelongsToManyGetAssociationsMixin<Role>;
    public createRole!: BelongsToManyCreateAssociationMixin<Role>;
    public addRoles!: BelongsToManyAddAssociationsMixin<Role, number>;
    public removeRoles!: BelongsToManyRemoveAssociationsMixin<Role, number>;
    public setRoles!: BelongsToManySetAssociationsMixin<Role, number>;

    public getYopaApplications!: BelongsToManyGetAssociationsMixin<YopaPosition>;
    public addYopaApplication!: BelongsToManyAddAssociationMixin<YopaPosition, number>;
    public removeYopaApplications!: BelongsToManyRemoveAssociationsMixin<YopaPosition, number>;
    public hasYopaApplication!: BelongsToManyHasAssociationMixin<YopaPosition, number>;

    public getNotifications!: BelongsToManyGetAssociationsMixin<Notification>;

    public removeSettledPosition!: HasManyRemoveAssociationMixin<YopaPosition, number>;

    public getCoins!: HasManyGetAssociationsMixin<Coin>;
    public createCoin!: HasManyCreateAssociationMixin<Coin>;

    // You can also pre-declare possible inclusions, these will only be populated if you
    // actively include a relation.
    public readonly feeds?: Feed[]; // Note this is optional since it's only populated when explicitly requested in code
    public readonly location?: Location;
    public readonly yopas?: Yopa[];
    public readonly comments?: Comment[];
    public readonly likedFeeds?: Feed[];
    public readonly likedYopas?: Yopa[];
    public roles?: Role[];
    public readonly yopaApplications?: YopaPosition[];
    public readonly followedUsers?: User[];
    public readonly fans?: User[];
    public readonly notifications?: Notification[];
    public readonly coins?: Coin[];
    public static associations: {
        feeds: Association<User, Feed>;
        location: Association<User, Location>;
        yopas: Association<User, Yopa>;
        comments: Association<User, Comment>;
        likedFeeds: Association<User, Feed>;
        likedYopas: Association<User, Yopa>;
        roles: Association<User, Role>;
        yopaApplications: Association<User, YopaPosition>;
        followedUsers: Association<User, User>;
        fans: Association<User, User>;
        notifications: Association<User, Notification>;
        coins: Association<User, Coin>;
    };
}

export const initUser = function() {
    User.init({
        openId: {
          type: new DataTypes.STRING(200),
          primaryKey: true,
        },
        name: {
          type: new DataTypes.STRING(128),
          allowNull: false,
        },
        gender: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true
        },
        avatar: {
          type: new DataTypes.STRING(100),
          allowNull: false
        },
        introduction: {
          type: new DataTypes.STRING(500),
        },
    }, {
        tableName: 'user',
        sequelize: sequelize,
    });
}
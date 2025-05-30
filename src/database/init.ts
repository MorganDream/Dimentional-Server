import { User, Feed, Location, Comment, initUser, initLocation, initFeed, initComment, initYopa, Yopa } from "./models";
import { initLike, Like } from "./models/join/like";
import { Role, initRole } from "./models/role";
import { initUserRole, UserRole } from "./models/join/user-role";
import { initYopaPosition, YopaPosition } from "./models/yopa-position";
import { UserYopaPosition, initUserYopaPosition } from "./models/join/user-yopa-position";
import { initNotification, Notification } from "./models/notification";
import { initUserNotification, UserNotification } from "./models/join/user-notification";
import { Coin, initCoin } from "./models/coin";

export default async function initDB() {
    initCoin();
    initUserYopaPosition();
    initUserRole();
    initRole();
    initLike();
    initLocation();
    initComment();
    initFeed();
    initYopa();
    initUser();
    initYopaPosition();
    initNotification();
    initUserNotification();

    /**
     * User <-> Coin
     */
    User.hasMany(Coin, {
        sourceKey: 'openId',
        foreignKey: 'openId',
        as: 'coins'
    });
    Coin.belongsTo(User, {
        targetKey: 'openId',
        foreignKey: 'openId',
        as: 'owner'
    })

    /**
     * ONE user has ONE position
     */
    Location.belongsTo(User, {
        targetKey: 'openId',
        foreignKey: 'openId',
        as: 'owner'
    });
    User.hasOne(Location, {
        sourceKey: 'openId',
        foreignKey: 'openId',
        as: 'location'
    });

    /**
     * ONE User can post MANY feeds 
     */
    User.hasMany(Feed, {
        sourceKey: 'openId',
        foreignKey: 'ownerId',
        as: 'feeds'
    });
    Feed.belongsTo(User, {
        targetKey: 'openId',
        foreignKey: 'ownerId',
        as: 'owner'
    })

    /**
     * ONE user can post MANY yopas
     */
    User.hasMany(Yopa, {
        sourceKey: 'openId',
        foreignKey: 'ownerId',
        as: 'yopas'
    });
    Yopa.belongsTo(User, {
        targetKey: 'openId',
        foreignKey: 'ownerId',
        as: 'owner'
    })
    
    /**
     * a feed has MANY fan users,
     * a user likes MANY feeds
     */
    User.belongsToMany(Feed, {
        through: {
            model: Like,
            unique: false,
        },
        sourceKey: 'openId',
        foreignKey: 'openId',
        constraints: false,
        as: 'likedFeeds'
    });
    Feed.belongsToMany(User, {
        through: {
            model: Like,
            unique: false,
        },
        sourceKey: 'id',
        foreignKey: 'feedId',
        constraints: false,
        as: 'fans'
    });

    /**
     * a yopa has MANY fan users,
     * a user likes MANY yopa
     */
    User.belongsToMany(Yopa, {
        through: {
            model: Like,
            unique: false,
        },
        sourceKey: 'openId',
        foreignKey: 'openId',
        constraints: false,
        as: 'likedYopas'
    });
    Yopa.belongsToMany(User, {
        through: {
            model: Like,
            unique: false,
        },
        sourceKey: 'id',
        foreignKey: 'yopaId',
        constraints: false,
        as: 'fans'
    });

    /**
     * a User has MANY fan Users,
     * a User has MANY followed Users
     */
    User.belongsToMany(User, {
        through: {
            model: Like,
            unique: false,
        },
        sourceKey: 'openId',
        foreignKey: 'openId',
        constraints: false,
        as: 'followedUsers'
    });
    User.belongsToMany(User, {
        through: {
            model: Like,
            unique: false,
        },
        sourceKey: 'openId',
        foreignKey: 'followOpenId',
        constraints: false,
        as: 'fans'
    });

    /**
     * ONE user can post many comments
     */
    User.hasMany(Comment, {
        sourceKey: 'openId',
        foreignKey: 'fromOpenId',
        as: 'comments'
    });
    Comment.belongsTo(User, {
        targetKey: 'openId',
        foreignKey: 'fromOpenId',
        as: 'owner'
    });

    /**
     * A feed can have MANY comments
     */
    Feed.hasMany(Comment, {
        sourceKey: 'id',
        foreignKey: 'feedId',
        as: 'comments'
    });
    Comment.belongsTo(Feed, {
        targetKey: 'id',
        foreignKey: 'feedId',
        as: 'feed'
    });

    /**
     * A yopa can have MANY comments
     */
    Yopa.hasMany(Comment, {
        sourceKey: 'id',
        foreignKey: 'yopaId',
        as: 'comments'
    });
    Comment.belongsTo(Yopa, {
        targetKey: 'id',
        foreignKey: 'yopaId',
        as: 'yopa'
    })

    /**
     * A comment can have MANY sub-comments
     */
    Comment.hasMany(Comment, {
        sourceKey: 'id',
        foreignKey: 'parentId',
        as: 'comments'
    });
    Comment.belongsTo(Comment, {
        foreignKey: 'parentId',
        targetKey: 'id',
        as: 'parentComment'
    });

    /**
     * User can have MANY roles
     * A role can group MANY users
     */
    User.belongsToMany(Role, { through:  UserRole, as: 'roles' });
    Role.belongsToMany(User, { through: UserRole,  as: 'users' });

    /**
     * ONE yopa can have MANY positions
     */
    Yopa.hasMany(YopaPosition, {
        sourceKey: 'id',
        foreignKey: 'yopaId',
        as: 'positions'
    });
    YopaPosition.belongsTo(Yopa, {
        targetKey: 'id',
        as: 'yopa'
    });

    /**
     * User may apply to MANY positions
     * A position may have MANY applicants
     */
    User.belongsToMany(YopaPosition, {
        through: UserYopaPosition,
        as: 'yopaApplications'
    });
    YopaPosition.belongsToMany(User, {
        through: UserYopaPosition,
        as: 'applicants'
    });

    /**
     * Positon have only ONE settled candidate
     * User may be chosen by MANY positions
     */
    User.hasMany(YopaPosition, {
        sourceKey: 'openId',
        foreignKey: 'settledOpenId',
        as: 'settledPositions'
    });
    YopaPosition.belongsTo(User, {
        as: 'settledUser'
    });

    User.belongsToMany(Notification, {
        through: {
            model: UserNotification,
            unique: false,
        },
        sourceKey: 'openId',
        foreignKey: 'toOpenId',
        constraints: false,
        as: 'notifications'
    });

    Notification.belongsToMany(User, {
        through: {
            model: UserNotification,
            unique: false,
        },
        sourceKey: 'id',
        foreignKey: 'notificationId',
        constraints: false,
        as: 'toNotifyUsers'
    });

    await Coin.sync();
    await Like.sync();
    await User.sync();
    await Location.sync();
    await Feed.sync();
    await Yopa.sync();
    await Comment.sync();
    await Role.sync();
    await UserRole.sync();
    await Yopa.sync();
    await YopaPosition.sync();
    await UserYopaPosition.sync();
    await UserNotification.sync();
    await Notification.sync();
}
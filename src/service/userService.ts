import { User, Location, Yopa, Feed } from "../database/models";
import { Context } from "koa";
import { Role } from "../database/models/role";
import { Op, Sequelize } from "sequelize";
import notificationService from "./notificationService";
import { Like } from "../database/models/join/like";
import { UserNotification } from "../database/models/join/user-notification";
import coinService from "./coinService";
import { CoinAction } from "../database/models/coin";

class UserService {
    async addUser(ctx: Context) {
        const openId: string = ctx.state.openId;
        const name: string = ctx.request.body.name;
        const gender: number = ctx.request.body.gender ;
        const avatar: string = ctx.request.body.avatar;
        const roles: Array<string> = ctx.request.body.roles;
        const user = await User.create({
            openId,
            name,
            gender,
            avatar,
        });
        await user.addRoles(await Role.findAll({
            where: {
                name: { [Op.in]: roles }
            }
        }));
        coinService.addCoin(CoinAction.FIRST_LOGIN, openId);
        return user;
    }

    async updateUser(ctx: Context) {
        const openId: string = ctx.state.openId;
        const { user: {
            name, avatar,gender, introduction, roles, location
        } } = ctx.request.body;
        const me = await User.findByPk(openId, {
            include: [{
                association: User.associations.location,
                as: 'location'
            }]
        });
        const { name: prevName, avatar: prevAvatar, gender: prevGender, introduction: prevIntroduction } = me;
        await User.update({
            name: name || prevName,
            avatar: avatar || prevAvatar,
            gender: gender || prevGender,
            introduction: introduction || prevIntroduction
        }, {
            where: {
                openId
            }
        }); 
        
        if (roles && roles.length > 0) {
            await Role.findAll({
                where: {
                    name: {[Op.in]: roles}
                }
            }).then(roles => me.setRoles(roles))
        }

        if (location) {
            if (!me.location) {
                await me.createLocation(location);
            } else {
                await Location.update(location, {
                    where: {
                        openId: me.openId
                    }
                })
            }
        }
        coinService.addCoin(CoinAction.COMPLETE_PERSONAL_INFO, ctx.state.openId);
    }

    async addRole(ctx: Context) {
        const roles = await Role.findAll({
            where: {
                name: {
                    [Op.or]: ctx.request.body.roles
                }
            }
        })

        const user = await User.findByPk(ctx.state.openId);
        return await user.addRoles(roles);
    }

    async removeRole(ctx: Context) {
        const roles = await Role.findAll({
            where: {
                name: {
                    [Op.or]: ctx.request.body.roles
                }
            }
        })

        const user = await User.findByPk(ctx.state.openId);
        return await user.removeRoles(roles);
    }

    async getUser(ctx: Context) {
        return User.findByPk(ctx.params.id);
    }

    async getHasFollowed(myId: string, openId: string) {
        const me = await User.findByPk(myId);
        return me.hasFollowedUser(openId);
    }

    async getIsMyFan(myId: string, openId: string) {
        const theGuy = await User.findByPk(openId);
        return theGuy.hasFollowedUser(myId);
    }

    async followUser(ctx: Context) {
        const me = await User.findByPk(ctx.state.openId);
        await me.addFollowedUser(ctx.request.body.openId);
        Like.findOne({
            where: {
                openId: me.openId,
                followOpenId: ctx.request.body.openId
            }
        }).then(like => notificationService.createFromLike(like));
    }

    async unFollowUser(ctx: Context) {
        const me = await User.findByPk(ctx.state.openId);
        await Like.findOne({
            attributes: ['id'],
            where: {
                openId: ctx.state.openId,
                followOpenId: ctx.request.body.openId
            }
        }).then(like => like.id).then(notificationService.cancelFromLike);
        await me.removeFollowedUser(ctx.request.body.openId);
    }

    async getUserDetail(ctx: Context) {
        return await User.findByPk(ctx.params.id, {
            include: [{
                association: User.associations.location,
                as: 'location'
            }, {
                association: User.associations.roles,
                attributes: ['name'],
                as: 'roles'
            },{
                association: User.associations.followedUsers,
                attributes: ['openId'],
                as: 'followedUsers'
            }, {
                association: User.associations.fans,
                attributes: ['openId'],
                as: 'fans'
            }]
        });
    }

    async findTheOne(ctx: Context) {
        const me = await User.findByPk(ctx.state.openId, {
            include: [{
                association: User.associations.followedUsers,
                attributes: ['openId'],
                as: 'followedUsers'
            }, {
                association: User.associations.fans,
                attributes: ['openId'],
                as: 'fans'
            }]
        });
        const { followedUsers, fans } = me;
        const targetOpenIds = (await User.findAll({
            attributes: ['openId'],
            where: {
                openId: {
                    [Op.notIn]: [...followedUsers.map(({openId}) => openId), ...fans.map(({openId}) => openId), me.openId]
                }
            }
        })).map(({openId}) => openId);
        return targetOpenIds[Math.floor(targetOpenIds.length * Math.random())];
    }

    async getFollowedUsers(ctx: Context) {
        const openId = ctx.query.openId || ctx.state.openId;
        const user = await User.findByPk(openId);
        return await user.getFollowedUsers();
    }

    async getFans(ctx: Context) {
        const openId = ctx.query.openId
        if (openId && openId !== ctx.state.openId) {
            const { fans } = await User.findByPk(ctx.query.openId, {
                include: [{
                    association: User.associations.fans,
                    as: 'fans'
                }]
            });
            return {
                fans
            };
        }

        const me = await User.findByPk(ctx.state.openId, {
            include: [{
                association: User.associations.fans,
                as: 'fans'
            }]
        });
        
        let notifications = await me.getNotifications({
            attributes: ['fanLikeId', 'id'],
            where: {
                fanLikeId: { [Op.ne]: null },
            }
        });

        const notificationIds = await UserNotification.findAll({
            attributes: ['notificationId'],
            where: {
                read: false,
                notificationId: { [Op.in]: notifications.map(noti => noti.id) }
            }
        }).then(userNotis => userNotis.map(userNoti => userNoti.notificationId));
        notifications = notifications.filter(noti => notificationIds.includes(noti.id));
        
        const newFanIds = notifications.length === 0? [] : await Like.findAll({
            where: {
                id: { [Op.in]: notifications.map(noti => noti.fanLikeId)}
            }
        }).then(likes => likes.map(like => like.openId));
        return {
            fans: me.fans,
            newFanIds,
            notificationIds
        }
    }

    async getFansFollowedNum(ctx: Context) {
        const openId = ctx.query.openId || ctx.state.openId;
        const { fans, followedUsers } = await User.findByPk(openId, {
            include: [{
                association: User.associations.fans,
                as: 'fans'
            }, {
                association: User.associations.followedUsers,
                as: 'followedUsers'
            }]
        });
        return {
            fansNum: fans.length,
            followNum: followedUsers.length
        }
    }
}

let userService: UserService = new UserService();
export default userService;
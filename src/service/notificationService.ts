import { Context } from "koa";
import { User, Comment, Feed, Yopa } from "../database/models";
import { Notification } from "../database/models/notification";
import { Like } from "../database/models/join/like";
import { YopaPosition } from "../database/models/yopa-position";
import { Op } from "sequelize";
import { UserNotification } from "../database/models/join/user-notification";

class NotificationService {
    async get(ctx: Context) {
        const me = await User.findByPk(ctx.state.openId);
        const result = {
            comments: 0,
            likes: 0,
            fans: 0,
            yopaPosition: 0,
            system: 0,
        }
        await UserNotification.findAll({
            attributes: ['notificationId'],
            where: {
                toOpenId: ctx.state.openId,
                read: false
            }
        }).then(userNotis => userNotis.map(userNoti => userNoti.notificationId))
        .then(notificationIds => Notification.findAll({
            where: {
                id: { [Op.in]: notificationIds }
            }
        }))
        .then(notifications => notifications.map(notification => {
            if (notification.commentId) {
                result.comments ++;
            } else if(notification.likeId) {
                result.likes ++;
            } else if(notification.fanLikeId) {
                result.fans ++;
            } else if(notification.yopaPositionId) {
                result.yopaPosition ++;
            }
        }));
        return result;
    }

    async getCommentsNotifications(ctx: Context) {
        const me = await User.findByPk(ctx.state.openId);
        const notificaitons = await me.getNotifications({
            attributes: ['commentId', 'id', 'updatedAt'],
            where: {
                // read: false,
                commentId: { [Op.ne]: null }
            },
            order: [
                ['updatedAt', 'DESC']
            ],
            limit: 20
        });
        const comments = await Comment.findAll({
            where: {
                id: { [Op.in]: notificaitons.map(notification => notification.commentId) }
            },
            order: [
                ['updatedAt', 'DESC']
            ],
            include: [{
                association: Comment.associations.owner,
                as: 'owner',
                attributes: ['name', 'avatar']
            },{
                association: Comment.associations.feed,
                as: 'feed',
                attributes: ['id', 'text'],
                include: [{
                    association: Feed.associations.owner,
                    as: 'owner',
                    attributes: ['name', 'avatar']
                }]
            }, {
                association: Comment.associations.yopa,
                as: 'yopa',
                attributes: ['id', 'text'],
                include: [{
                    association: Yopa.associations.owner,
                    as: 'owner',
                    attributes: ['name', 'avatar']
                }]
            }, {
                association: Comment.associations.parentComment,
                as: 'parentComment',
                include: [{
                    association: Comment.associations.feed,
                    attributes: ['id', 'text'],
                    as: 'feed',
                    include: [{
                        association: Feed.associations.owner,
                        as: 'owner',
                        attributes: ['name', 'avatar']
                    }]
                }, {
                    association: Comment.associations.yopa,
                    as: 'yopa',
                    attributes: ['id', 'text'],
                    include: [{
                        association: Yopa.associations.owner,
                        as: 'owner',
                        attributes: ['name', 'avatar']
                    }]
                }, {
                    association: Comment.associations.owner,
                    as: 'owner',
                    attributes: ['name']
                }]
            }]
        });
        return {
            comments,
            notificationIds: notificaitons.map(noti => noti.id)
        }
    }

    async getLikeNotifications(ctx: Context) {
        const me = await User.findByPk(ctx.state.openId);
        const notificaitions = await me.getNotifications({
            attributes: ['likeId', 'id', 'updatedAt'],
            where: {
                likeId: { [Op.ne]: null },
                // read: false,
            },
            order: [
                ['updatedAt', 'DESC']
            ],
            limit: 20
        });
        const likeIds = notificaitions.map(noti => noti.likeId);

        const yopas = await Yopa.findAll({
            include: [{
                association: Yopa.associations.fans,
                through: {
                    where: {
                        id: { [Op.in]: likeIds }
                    }
                },
                as: 'fans'
            }, {
                association: Yopa.associations.owner,
                as: 'owner'
            }],
            where: {
                ownerId: me.openId
            }
        }).then(yopas => yopas.filter(yopa => yopa.fans.length > 0));

        const feeds = await Feed.findAll({
            include: [{
                association: Feed.associations.fans,
                through: {
                    where: {
                        id: { [Op.in]: likeIds}
                    }
                },
                as: 'fans'
            }, {
                association: Feed.associations.owner,
                as: 'owner'
            }],
            where: {
                ownerId: me.openId
            }
        }).then(feeds => feeds.filter(feed => feed.fans.length > 0));

        return {
            yopas,
            feeds,
            notificationIds: notificaitions.map(noti => noti.id)
        }
    }

    async getFansNotification(ctx: Context) {
        return UserNotification.findAll({
            attributes: ['notificationId'],
            where: {
                toOpenId: ctx.state.openId,
                read: false
            },
            order: [
                ['updatedAt', 'DESC']
            ]
        }).then(userNotis => userNotis.map(userNoti => userNoti.notificationId))
        .then(notificationIds => Notification.findAll({
            attributes: ['fanLikeId'],
            where: {
                id: { [Op.in]: notificationIds },
                fanLikeId: { [Op.ne]: null }
            }
        }))
        .then(notifications => Like.findAll({
            attributes: ['openId'],
            where: {
                id: { [Op.in]:  notifications.map(noti => noti.fanLikeId)}
            }
        })).then(likes => User.findAll({
            where: {
                openId: { [Op.in]: likes.map(like => like.openId) }
            }
        }));
    }

    async getYopaPositionNotification(ctx: Context) {
        const me = await User.findByPk(ctx.state.openId);
        const notifications = await me.getNotifications({
            attributes: ['yopaPositionId', 'id', 'from','updatedAt'],
            where: {
                yopaPositionId: { [Op.ne]: null },
                // read: false,
            },
            order: [
                ['updatedAt', 'DESC']
            ],
            limit: 20
        });
        let yopas = await Yopa.findAll({
            include: [{
                association: Yopa.associations.positions,
                as: 'positions',
                where: {
                    id: { [Op.in]: notifications.map(noti => noti.yopaPositionId) }
                }
            }, {
                association: Yopa.associations.owner,
                as: 'owner',
            }]
        });
        // sort
        yopas.sort((first, second) => {
            if (first.positions.some(posFromFirst => 
                second.positions.every(posFromSecond => posFromSecond.updatedAt <= posFromFirst.updatedAt)
            )) {
                return -1;
            } else {
                return 1;
            }
        })
        return {
            yopas,
            notificationIds: notifications.map(noti => noti.id)
        }
    }

    async read(ctx: Context) {
        const { notificationId } = ctx.request.body;
        return await Notification.update({ read: true }, {
            where: {
                id: notificationId
            }
        });
    }

    async readNotifications(openId: string, notificationIds: Array<number>) {
        UserNotification.update({
            read: true
        }, {
            where: {
                toOpenId: openId,
                notificationId: { [Op.in]: notificationIds }
            }
        })
    }

    async readComments(ctx: Context) {
        Notification.update({
            read: true
        }, {
            fields: ['read'],
            where: {

            }
        })
    }

    async readLike(ctx: Context) {
        Notification.update({
            read: true
        }, {
            where: {
                likeId: { [Op.ne]: null },
                toOpenId: ctx.state.openId
            }
        });
    }

    async readFans(ctx: Context) {
        Notification.update({
            read: true
        }, {
            where: {
                fanLikeId: { [Op.ne]: null },
                toOpenId: ctx.state.openId
            }
        });
    }

    async createFromComment(comment: Comment) {
        const { replyToOpenId, feedId, parentId, id, fromOpenId, yopaId } = comment;
        let toNotifyOpenIds = [];
        if (replyToOpenId && !toNotifyOpenIds.includes(replyToOpenId)) {
            toNotifyOpenIds.push(replyToOpenId);
        }

        if (parentId) {
            const { fromOpenId: parentCommentId } = await Comment.findByPk(parentId); 
            if (parentCommentId && !toNotifyOpenIds.includes(parentCommentId) && parentCommentId !== fromOpenId) {
                toNotifyOpenIds.push(parentCommentId);
            }
        }

        if (feedId) {
            const { ownerId } = await Feed.findByPk(feedId);
            if (ownerId && !toNotifyOpenIds.includes(ownerId) && ownerId !== fromOpenId) {
                toNotifyOpenIds.push(ownerId);
            }
        }

        if (yopaId) {
            const { ownerId } = await Yopa.findByPk(yopaId);
            if (ownerId && !toNotifyOpenIds.includes(ownerId) && ownerId !== fromOpenId) {
                toNotifyOpenIds.push(ownerId);
            }
        }
        
        toNotifyOpenIds = toNotifyOpenIds.filter(openId => openId !== fromOpenId);
        if (toNotifyOpenIds.length <= 0) {
            return ;
        }

        const notification = await Notification.create({
            commentId: id,
            from: fromOpenId,
            read: false,
        });

        await notification.addToNotifyUsers(toNotifyOpenIds);
        return notification;
    }

    async cancelFromComment(commentId: number) {
        await Notification.destroy({
            where: {
                commentId
            }
        });
    }

    async createFromLike(like: Like) {
        const { id, openId, feedId, yopaId, followOpenId } = like;
        if (followOpenId) {
            const [notification] = await Notification.findCreateFind({
                where: {
                    fanLikeId: id,
                    from: openId
                }
            });
            notification.setAttributes('read', false)
            await notification.setToNotifyUsers([followOpenId]);
            return notification;
        }
        let toNotifyOpenIds = [];

        if (feedId) {
            const { ownerId } = await Feed.findByPk(feedId);
            if (ownerId && !toNotifyOpenIds.includes(ownerId) && ownerId !== openId) {
                toNotifyOpenIds.push(ownerId);
            }
        }

        if (yopaId) {
            const { ownerId } = await Yopa.findByPk(yopaId);
            if (ownerId && !toNotifyOpenIds.includes(ownerId) && ownerId !== openId) {
                toNotifyOpenIds.push(ownerId);
            }
        }

        toNotifyOpenIds = toNotifyOpenIds.filter(mock => mock !== openId);
        if (toNotifyOpenIds.length <= 0) {
            return ;
        }

        const notification = await Notification.create({
            likeId: id,
            from: openId,
            read: false,
        });
        
        await notification.addToNotifyUsers(toNotifyOpenIds);
        return notification;
    }

    async cancelFromLike(likeId: number) {
        await Notification.destroy({
            where: {
                [Op.or]: [{
                    likeId
                }, {
                    fanLikeId: likeId
                }]
            }
        });
    }

    async createFromYopaPositionApplication(yopaPosition: YopaPosition, fromOpenId: string) {
        const { id, yopaId } = yopaPosition;

        let toNotifyOpenIds = [];
        const applicants = await yopaPosition.getApplicants();
        const yopa = await Yopa.findByPk(yopaId);
        if (fromOpenId === yopa.ownerId) {
            toNotifyOpenIds.push(...applicants);
        } else {
            toNotifyOpenIds.push(yopa.ownerId);
        }

        toNotifyOpenIds = toNotifyOpenIds.filter(mock => mock !== fromOpenId);
        if (toNotifyOpenIds.length <= 0) {
            return ;
        }

        const notification = await Notification.create({
            yopaPositionId: id,
            from: fromOpenId,
            read: false,
        });
        
        await notification.addToNotifyUsers(toNotifyOpenIds);
        return notification;
    }

    async cancelFromYopaPositionApplication(positionId: number, fromOpenId: string) {
        await Notification.destroy({
            where: {
                yopaPositionId: positionId,
                from: fromOpenId
            }
        });
    }
}

let notificationService: NotificationService = new NotificationService();
export default notificationService;
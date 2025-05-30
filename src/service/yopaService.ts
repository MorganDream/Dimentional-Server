import { Context } from "koa";
import { Yopa, User, Comment } from "../database/models";
import { Op, Sequelize } from "sequelize";
import { YopaPosition } from "../database/models/yopa-position";
import { Like } from "../database/models/join/like";
import notificationService from "./notificationService";
import coinService from "./coinService";
import { CoinAction } from "../database/models/coin";

class YopaService {
    async post(ctx: Context) {
        const me = await User.findByPk(ctx.state.openId);
        const tags = JSON.stringify(ctx.request.body.tags);
        const images = JSON.stringify(ctx.request.body.images);
        const yopa = await me.createYopa({
            ...ctx.request.body,
            ...{
                tags,
                images
            }
        });
        const { positions = [] } = ctx.request.body;
        await Promise.all(positions.map(pos => yopa.createPosition(pos)))
        coinService.addCoin(CoinAction.POST, me.openId);
        return yopa;
    }

    async getAll(ctx: Context) {
        const ownerId = ctx.query.ownerId;
        const iLike = Boolean(ctx.query.iLike);
        const lastYopaId: number = Number(ctx.query.lastYopaId);
        const limit: number = Number(ctx.query.limit) || 10;

        const { area, category, positionType } = JSON.parse(ctx.query.filter || '{}')
        const searchKey = ctx.query.searchKey;

        let yopas = await Yopa.findAll({
            where: {
                ...!!lastYopaId && {
                    id: { [Op.lt]: lastYopaId }
                },
                ...ownerId && ownerId !== 'undefined' && {
                    ownerId
                },
                ...area && area !== 'undefined' && {
                    area: { [Op.like]: `%${area}%` }
                },
                ...category && category !== 'undefined' && {
                    category
                },
                ...searchKey && searchKey !== 'undefined' && {
                    [Op.or]: [
                        {
                          title: {
                            [Op.like]: `%${searchKey}%`
                          }
                        },
                        {
                          text: {
                            [Op.like]: `%${searchKey}%`
                          }
                        }
                    ]
                }
            },
            order: [['id', 'DESC']],
            limit,
            include: [{
                association: Yopa.associations.owner,
                include: [User.associations.roles],
                as: 'owner'
            }, {
                association: Yopa.associations.positions,
                include: [
                    YopaPosition.associations.applicants,
                    YopaPosition.associations.settledUser
                ],
                as: 'positions',
                where: {
                    ...positionType && positionType !== 'undefined' && {
                        type: positionType
                    }
                }
            }, {
                association: Yopa.associations.comments,
                attributes: ['id'],
            }, {
                association: Yopa.associations.fans,
                attributes: ['openId'],
                as: 'fans'
            }]
        }).then(res => res.map(yopa => {
            yopa.images = JSON.parse(yopa.images);
            yopa.tags = JSON.parse(yopa.tags);
            return yopa;
        }));
        if (iLike) {
            let filteredYopas = [];
            for(let i = 0; i < yopas.length; i++) {
                if (await yopas[i].hasFan(ctx.state.openId)) {
                    filteredYopas.push(yopas[i]);
                }
            }
            yopas = filteredYopas;
        }
        return yopas;
    }

    async getYopaDetail(ctx: Context) {
        const yopaId = ctx.query.yopaId;
        return await Yopa.findByPk(yopaId, {
            include: [{
                association: Yopa.associations.owner,
                include: [User.associations.roles],
                as: 'owner'
            }, {
                association: Yopa.associations.positions,
                include: [
                    YopaPosition.associations.applicants,
                    YopaPosition.associations.settledUser
                ],
                as: 'positions'
            }, {
                association: Yopa.associations.comments,
                as: 'comments',
                include: [{
                    association: Comment.associations.owner,
                    as: 'owner',
                    include: [{
                        association: User.associations.roles,
                        as: 'roles',
                        attributes: ['name']
                    }]
                }, {
                    association: Comment.associations.comments,
                    as: 'comments',
                    include: [{
                        association: Comment.associations.owner,
                        as: 'owner',
                        include: [{
                            association: User.associations.roles,
                            as: 'roles',
                            attributes: ['name']
                        }]
                    }]
                }]
            }, {
                association: Yopa.associations.fans,
                as: 'fans'
            }]
        }).then(res => {
            res.images = JSON.parse(res.images);
            res.tags = JSON.parse(res.tags);
            return res;
        })
    }

    async like(ctx: Context) {
        const yopaId = ctx.request.body.yopaId;
        const me = await User.findByPk(ctx.state.openId);
        const iLike = await me.hasLikedYopas(yopaId);
        if (iLike) {
            await Like.findOne({
                attributes: ['id'],
                where: {
                    openId: ctx.state.openId,
                    yopaId
                }
            }).then(like => like.id).then(notificationService.cancelFromLike);
            await me.removeLikedYopa(yopaId);
        } else {
            await me.addLikedYopa(yopaId);
            Like.findOne({
                where: {
                    openId: me.openId,
                    yopaId
                }
            }).then(notificationService.createFromLike);
        }
    }

    async applyForPosition(ctx: Context) {
        const me = await User.findByPk(ctx.state.openId);
        const positionId = ctx.request.body.positionId;
        const hasApplied = await me.hasYopaApplication(positionId);
        if (hasApplied) {
            return false;
        }
        await me.addYopaApplication(positionId);
        const fuck = await YopaPosition.findByPk(positionId)
            .then(pos => {
                YopaPosition.update({
                    type: pos.type // just update something to update the updatedAt
                }, {
                    where: {
                        id: pos.id
                    }
                })
                return notificationService.createFromYopaPositionApplication(pos, ctx.state.openId);
            });
        coinService.addCoin(CoinAction.APPLY, me.openId);
        return true;
    }

    async canclePositionApplication(ctx: Context) {
        const me = await User.findByPk(ctx.state.openId);
        const positionId = ctx.request.body.positionId;
        const hasApplied = await me.hasYopaApplication(positionId);
        if (!hasApplied) {
            return false;
        }
        notificationService.cancelFromYopaPositionApplication(positionId, ctx.state.openId);
        await me.removeYopaApplications(positionId);
        return true;
    }

    async settlePosition(ctx: Context) {
        const settleOpenId = ctx.request.body.openId;
        const openId = ctx.state.openId;
        const positionId = ctx.request.body.positionId;
        const position = await YopaPosition.findByPk(positionId, {
            include: [{
                association: YopaPosition.associations.yopa,
                as: 'yopa'
            }]
        });
        if(position.yopa.ownerId !== openId) {
            return false;
        }
        
        await position.setSettledUser(settleOpenId);
        notificationService.createFromYopaPositionApplication(position, ctx.state.openId);
        coinService.addCoin(CoinAction.SETTLE_POSITION, openId);
        return true;
    }

    async cancelSettlePosition(ctx: Context) {
        const settleOpenId = ctx.request.body.openId;
        const openId = ctx.state.openId;
        const positionId = ctx.request.body.positionId;
        const position = await YopaPosition.findByPk(positionId, {
            include: [{
                association: YopaPosition.associations.yopa,
                as: 'yopa'
            }]
        });
        if(position.yopa.ownerId !== openId) {
            return false;
        }

        await YopaPosition.update({
            settledUserOpenId: null
        }, {
            where: {
                id: positionId
            }
        })
        return true;
    }

    async lock(ctx: Context) {
        const openId = ctx.state.openId;
        const yopaId = ctx.request.body.yopaId;
        const me = await User.findByPk(openId);
        const canI = await me.hasYopa(yopaId)
        if (!canI) {
            return Promise.reject('没有权限');
        }
        return await Yopa.update({
            locked: true
        }, {
            where: {
                id: yopaId
            }
        })
    }

    async unLock(ctx: Context) {
        const openId = ctx.state.openId;
        const yopaId = ctx.request.body.yopaId;
        const me = await User.findByPk(openId);
        const canI = await me.hasYopa(yopaId)
        if (!canI) {
            return Promise.reject('没有权限');
        }
        return await Yopa.update({
            locked: false
        }, {
            where: {
                id: yopaId
            }
        })
    }

    async getYopasIApplied(ctx: Context) {
        const me = await User.findByPk(ctx.state.openId);
        const yopaIds = Array.from(new Set(await me.getYopaApplications({
            attributes: ['yopaId'],
        }).then(posistions => posistions.map(pos => pos.yopaId))));
        return Yopa.findAll({
            where: {
                id: { [Op.in]: yopaIds }
            },
            include: [{
                association: Yopa.associations.owner,
                include: [User.associations.roles],
                as: 'owner'
            }, {
                association: Yopa.associations.positions,
                as: 'positions',
                include: [{
                    association: YopaPosition.associations.applicants,
                    as: 'applicants',
                    attributes: ['openId']
                }]
            }]
        });
    }
}

let yopaService: YopaService = new YopaService();
export default yopaService;
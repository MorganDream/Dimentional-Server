import { Context } from "koa";
import { Feed, User, Comment } from "../database/models";
import { Op } from "sequelize";
import userService from "./userService";
import commentService from "./commentService";
import { Like } from "../database/models/join/like";
import notificationService from "./notificationService";
import coinService from "./coinService";
import { CoinAction } from "../database/models/coin";

class FeedService {
    async post(ctx: Context) {
        const ownerId = ctx.state.openId;
        const text = ctx.request.body.text;
        const images = JSON.stringify(ctx.request.body.images);
        const tags = JSON.stringify(ctx.request.body.tags);
        const feed = await Feed.create({
            ownerId,
            text,
            images,
            tags
        });
        coinService.addCoin(CoinAction.POST, ownerId);
        return feed;
    }

    async getAll(ctx: Context) {
        const ownerId = ctx.query.ownerId;
        const iLike = Boolean(ctx.query.iLike);
        const fromFollowed = Boolean(ctx.query.fromFollowed);
        const sameCity = Boolean(ctx.query.sameCity);
        const lastFeedId: number = Number(ctx.query.lastFeedId);
        const limit: number = Number(ctx.query.limit) || 10;

        let feeds = await Feed.findAll({
            where: {
                ...!!lastFeedId && {
                    id: { [Op.lt]: lastFeedId }
                },
                ...ownerId && ownerId !== 'undefined' && {
                    ownerId
                },
            },
            order: [['id', 'DESC']],
            limit,
            include: [{
                association: Feed.associations.owner,
                include: [User.associations.roles],
                as: 'owner',
            }]
        });
        
        const me = await User.findByPk(ctx.state.openId);
        if (fromFollowed) {
            let filterredFeeds = [];
            for(let i = 0; i < feeds.length; i++) {
                if (await feeds[i].owner.hasFan(me)) {
                    filterredFeeds.push(feeds[i]);
                }
            }
            feeds = filterredFeeds;
        }

        if (sameCity) {
            const { province: myCity } = await me.getLocation();
            if (!myCity) {
                return [];
            }
            let filterredFeeds = [];
            for(let i = 0; i < feeds.length; i++) {
                if ((await feeds[i].owner.getLocation()).province === myCity) {
                    filterredFeeds.push(feeds[i]);
                }
            }
            feeds = filterredFeeds;
        }
        
        let processedFeeds = await Promise.all(feeds.map(async feed => {
            feed.images = JSON.parse(feed.images);
            feed.tags = JSON.parse(feed.tags);
            feed.likes = await feed.countFans();
            return {
                feed,
                commentNum: await feed.countComments(),
                iLike: await me.hasLikedFeeds(feed)
            }
        }));

        if (iLike) {
            processedFeeds = processedFeeds.filter(feed => feed.iLike)
        }
        return processedFeeds;
    }

    async like(ctx: Context) {
        const feedId = ctx.request.body.feedId;
        const me = await User.findByPk(ctx.state.openId);
        const iLike = await me.hasLikedFeeds(feedId);
        if (iLike) {
            await Like.findOne({
                attributes: ['id'],
                where: {
                    openId: ctx.state.openId,
                    feedId
                }
            }).then(like => like.id).then(notificationService.cancelFromLike);
            await me.removeLikedFeed(feedId);
        } else {
            await me.addLikedFeed(feedId);
            Like.findOne({
                where: {
                    openId: me.openId,
                    feedId
                }
            }).then(notificationService.createFromLike);
        }
    }

    async getFeedDetail(ctx: Context) {
        const me = await User.findByPk(ctx.state.openId);
        const feedId = ctx.query.feedId;
        let feed = await Feed.findByPk(feedId, {
            include: [{
                association: Feed.associations.owner,
                as: 'owner',
                include: [{
                    association: User.associations.roles,
                    as: 'roles'
                }]
            }, {
                association: Feed.associations.comments,
                as: 'comments',
                include: [{
                    association: Comment.associations.comments,
                    as: 'comments',
                    include: [{
                        association: Comment.associations.owner,
                        as: 'owner',
                        include: [{
                            association: User.associations.roles,
                            as: 'roles'
                        }]
                    }]
                }, {
                    association: Comment.associations.owner,
                    as: 'owner',
                    include: [{
                        association: User.associations.roles,
                        as: 'roles'
                    }]
                }]
            }, {
                association: Feed.associations.fans,
                as: 'fans'
            }]
        });
        feed.images = JSON.parse(feed.images);
        feed.tags = JSON.parse(feed.tags);
        return {
            feed,
            iLike: await me.hasLikedFeeds(feed),
        }
    }
}

let feedService: FeedService = new FeedService();
export default feedService;
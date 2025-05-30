import { Context } from "koa";
import feedService from "../service/feedService";
import httpConstants from "../constant/httpConstants";

class FeedController {
    async post(ctx: Context) {
        const feed= await feedService.post(ctx);
        ctx.body = {
            feedId: feed.id
        }
        ctx.status = httpConstants.HTTP_CREATED;
    }

    async getAllFeeds(ctx: Context) {
        try {
            const feeds = await feedService.getAll(ctx);
            ctx.body = {
                feeds,
            };
        } catch(err) {
            ctx.body = {
                error: err
            };
            ctx.status = httpConstants.HTTP_INTERNAL_SERVER_ERROR;
        }
    }

    async getFeedDetail(ctx: Context) {
        try {
            const result = await feedService.getFeedDetail(ctx);
            ctx.body = result;
        } catch(err) {
            ctx.body = {
                error: err
            };
            ctx.status = httpConstants.HTTP_INTERNAL_SERVER_ERROR;
        }
    }

    async like(ctx: Context) {
        await feedService.like(ctx);
        ctx.status = httpConstants.HTTP_CREATED;
    }
}

const feedController: FeedController = new FeedController()
export default feedController 
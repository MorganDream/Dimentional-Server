import { Context } from "koa";
import notificationService from "../service/notificationService";
import httpConstants from "../constant/httpConstants";

class NotificationController {
    async get(ctx: Context) {
        const notifications = await notificationService.get(ctx);
        ctx.body = {
            notifications
        };
        ctx.status = httpConstants.HTTP_SUCCESS_OK;
    }

    async getComments(ctx: Context) {
        const { comments, notificationIds } = await notificationService.getCommentsNotifications(ctx);
        ctx.body = {
            comments
        };
        ctx.status = httpConstants.HTTP_SUCCESS_OK;
        notificationService.readNotifications(ctx.state.openId, notificationIds);
    }

    async getLikes(ctx: Context) {
        const {feeds, yopas, notificationIds} = await notificationService.getLikeNotifications(ctx);
        ctx.body = {
            likes : {
                feeds, yopas
            }
        };
        ctx.status = httpConstants.HTTP_SUCCESS_OK;
        notificationService.readNotifications(ctx.state.openId, notificationIds);
    }

    async getFans(ctx: Context) {
        const fans = await notificationService.getFansNotification(ctx);
        ctx.body = {
            fans
        };
        ctx.status = httpConstants.HTTP_SUCCESS_OK;
    }

    async getYopaPositions(ctx: Context) {
        const { yopas, notificationIds } = await notificationService.getYopaPositionNotification(ctx);
        ctx.body = {
            yopas
        };
        ctx.status = httpConstants.HTTP_SUCCESS_OK;
        notificationService.readNotifications(ctx.state.openId, notificationIds);
    }

    async read(ctx: Context)  {
        await notificationService.read(ctx);
        ctx.status = httpConstants.HTTP_SUCCESS_OK;
    }

    async readComments(ctx: Context) {
        await notificationService.readComments(ctx);
        ctx.status = httpConstants.HTTP_SUCCESS_OK;
    }

    async readLike(ctx: Context) {
        await notificationService.readLike(ctx);
        ctx.status = httpConstants.HTTP_SUCCESS_OK;
    }

    async readFans(ctx: Context) {
        await notificationService.readFans(ctx);
        ctx.status = httpConstants.HTTP_SUCCESS_OK;
    }
}

let notificationController = new NotificationController();
export default notificationController;
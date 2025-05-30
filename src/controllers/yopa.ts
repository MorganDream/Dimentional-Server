import { Context } from "koa";
import yopaService from "../service/yopaService";
import httpConstants from "../constant/httpConstants";

class YopaController {
    async post(ctx: Context) {
        const yopa = await yopaService.post(ctx);
        ctx.body = {
            yopa
        }
        ctx.status = httpConstants.HTTP_CREATED;
    }

    async getAll(ctx: Context) {
        try {
            const yopas = await yopaService.getAll(ctx);
            ctx.body = {
                yopas
            };
            ctx.status = httpConstants.HTTP_SUCCESS_OK;
        } catch(err) {
            ctx.status=httpConstants.HTTP_INTERNAL_SERVER_ERROR;
            ctx.body = {
                err
            }
        }   
    }

    async getDetail(ctx: Context) {
        const yopa = await yopaService.getYopaDetail(ctx);
        ctx.body = {
            yopa
        };
        ctx.status = httpConstants.HTTP_SUCCESS_OK;
    }

    async like(ctx: Context) {
        await yopaService.like(ctx);
        ctx.status = httpConstants.HTTP_CREATED;
    }

    async applyForPosition(ctx: Context) {
        const result = await yopaService.applyForPosition(ctx);
        if (result) {
            ctx.status = httpConstants.HTTP_SUCCESS_OK;
        } else {
            ctx.status = httpConstants.HTTP_CONFLICT;
            ctx.body = {
                error: 'You have already applied this position.'
            }
        }
    }

    async canclePositionApplication(ctx: Context) {
        const result = await yopaService.canclePositionApplication(ctx);
        if (result) {
            ctx.status = httpConstants.HTTP_SUCCESS_OK;
        } else {
            ctx.status = httpConstants.HTTP_CONFLICT;
            ctx.body = {
                error: 'You have not applied this position.'
            }
        }
    }

    async settlePosition(ctx: Context) {
        const result = await yopaService.settlePosition(ctx);
        if (result) {
            ctx.status = httpConstants.HTTP_SUCCESS_OK;
        } else {
            ctx.status = httpConstants.HTTP_CONFLICT;
            ctx.body = {
                error: 'You have no access to edit this yopa.'
            }
        }
    }

    async cancelSettlePosition(ctx: Context) {
        const result = await yopaService.cancelSettlePosition(ctx);
        if (result) {
            ctx.status = httpConstants.HTTP_SUCCESS_OK;
        } else {
            ctx.status = httpConstants.HTTP_CONFLICT;
            ctx.body = {
                error: 'You have no access to edit this yopa.'
            }
        }
    }

    async lock(ctx: Context) {
        try {
            await yopaService.lock(ctx);
            ctx.status = httpConstants.HTTP_SUCCESS_OK;
        } catch(err) {
            ctx.status=httpConstants.HTTP_UNAUTHORISED;
            ctx.body = {
                err
            }
        }  
    }

    async unLock(ctx: Context) {
        try {
            await yopaService.unLock(ctx);
            ctx.status = httpConstants.HTTP_SUCCESS_OK;
        } catch(err) {
            ctx.status=httpConstants.HTTP_UNAUTHORISED;
            ctx.body = {
                err
            }
        }  
    }

    async getYopasIApplied(ctx: Context) {
        try {
            const yopas = await yopaService.getYopasIApplied(ctx);
            ctx.status = httpConstants.HTTP_SUCCESS_OK;
            ctx.body = {
                yopas
            }
        } catch(err) {
            ctx.status=httpConstants.HTTP_UNAUTHORISED;
            ctx.body = {
                err
            }
        }  
    }
}

let yopaController: YopaController = new YopaController();
export default yopaController;
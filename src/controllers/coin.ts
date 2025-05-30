import { Context } from "koa"
import { CoinAction } from "../database/models/coin";
import coinService from "../service/coinService";
import httpConstants from "../constant/httpConstants";

class CoinController {
    async get(ctx: Context) {
        const total = await coinService.get(ctx);
        ctx.status = httpConstants.HTTP_SUCCESS_OK;
        ctx.body = {
            total
        }
    }

    async getCoins(ctx: Context) {
        const coins = await coinService.getCoins(ctx);
        ctx.status = httpConstants.HTTP_SUCCESS_OK;
        ctx.body = {
            coins
        }
    }

    async everyDaySignIn(ctx: Context) {
        try {
            const coin = await coinService.addCoin(CoinAction.DAILY_SIGNIN, ctx.state.openId);
            ctx.status = httpConstants.HTTP_SUCCESS_OK;
            ctx.body = {
                coin
            }
        } catch(e) {
            ctx.status = httpConstants.HTTP_INTERNAL_SERVER_ERROR;
            ctx.body = {
                error: e
            }
        }
    }

    async subscribe(ctx: Context) {
        try {
            const coin = await coinService.addCoin(CoinAction.SUBSCRIBE, ctx.state.openId);
            ctx.status = httpConstants.HTTP_SUCCESS_OK;
            ctx.body = {
                coin
            }
        } catch(e) {
            ctx.status = httpConstants.HTTP_INTERNAL_SERVER_ERROR;
            ctx.body = {
                error: e
            }
        }
    }

    async share(ctx: Context) {
        try {
            const coin = await coinService.addCoin(CoinAction.SHARE, ctx.state.openId);
            ctx.status = httpConstants.HTTP_SUCCESS_OK;
            ctx.body = {
                coin
            }
        } catch(e) {
            ctx.status = httpConstants.HTTP_INTERNAL_SERVER_ERROR;
            ctx.body = {
                error: e
            }
        }
    }
}

const coinController: CoinController = new CoinController()
export default coinController 
import { CoinAction, Coin, CoinValue } from "../database/models/coin";
import { User } from "../database/models";
import { Context } from "koa";

class CoinService {
    async getCoins(ctx: Context) {
        const me = await User.findByPk(ctx.state.openId);
        const coins = await me.getCoins();
        return coins;
    }

    async get(ctx: Context) {
        const coins = await this.getCoins(ctx);
        return coins.map(coin => coin.change).reduce((total, change) => total + change);
    }
    
    async addCoin(action: CoinAction, openId: string) {
        const user = await User.findByPk(openId);
        const coins = await user.getCoins();
        switch(action) {
            case CoinAction.FIRST_LOGIN:
            case CoinAction.SUBSCRIBE:
            case CoinAction.COMPLETE_PERSONAL_INFO: {
                if (coins.every(coin => coin.action !== action)) {
                    return user.createCoin({
                        action,
                        change: CoinValue.get(action)
                    });
                };
                return;
            }
            case CoinAction.DAILY_SIGNIN: { // 限制每日一次
                const today = new Date();
                if (coins.every(coin => coin.action !== action || coin.createdAt.toDateString() !== today.toDateString())) {
                    return user.createCoin({
                        action,
                        change: CoinValue.get(action)
                    });
                }
                return ;
            }
            case CoinAction.SHARE: { // 限制每日三次
                const today = new Date();
                const todaySameActionCoins = coins.filter(coin => coin.createdAt.toDateString() === today.toDateString() && coin.action === action)
                if (todaySameActionCoins.length < 3) {
                    return user.createCoin({
                        action,
                        change: CoinValue.get(action)
                    });
                }
                return ;
            }
            case CoinAction.APPLY:
            case CoinAction.SETTLE_POSITION:
            case CoinAction.POST: {
                return user.createCoin({
                    action,
                    change: CoinValue.get(action)
                });
            }
        }
    }
}

let coinService = new CoinService();
export default coinService;
import { Context } from "koa";
import axios from 'axios';
import jwt from 'jwt-simple';
import { JWT_CONFIG, QQ_CONFIG } from '../config';
import httpConstants from "../constant/httpConstants";
import { User } from "../database/models";
import coinService from "../service/coinService";
import { CoinAction } from "../database/models/coin";

class AuthController {
    async login(ctx: Context) {
        const code: string = ctx.query.code;
        const qqres = await axios.get(`https://api.q.qq.com/sns/jscode2session?appid=${QQ_CONFIG.appid}&secret=${QQ_CONFIG.appsecret}&js_code=${code}&grant_type=${QQ_CONFIG.granttype}`);
        if (qqres.data.errorcode) {
            ctx.status = httpConstants.HTTP_BAD_REQUEST,
            ctx.body = qqres.data;
            return;
        }
        const openid = qqres.data.openid;
        const user = await User.findByPk(openid, {
            include: [{
                association: User.associations.location,
                as: 'location'
            }, {
                association: User.associations.roles,
                as: 'roles'
            }]
        });
        const token = jwt.encode({
            uid: openid,
            exp: Date.now() + JWT_CONFIG.expire
        }, JWT_CONFIG.token);
        ctx.body = {
            token,
            user
        }
    }
}

const authController: AuthController = new AuthController()
export default authController 
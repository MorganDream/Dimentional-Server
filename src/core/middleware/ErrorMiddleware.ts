import { Context } from "koa";
import httpConstants from '../../constant/httpConstants'
import { decode } from "jwt-simple";
import { JWT_CONFIG } from "../../config";
// import models from '../../database/models'

type Next = () => Promise<any>;
const NoLoginPath = [
    'login'
];

class ErrorMiddleware {
    private getToken(ctx: Context) {
        return ctx.header.authorization
    }

    errorMiddleware() {
        return async (ctx: Context, next: Next) => {
            try {
                await next()
            } catch (err) {
                ctx.status = err.status || 500
                ctx.body = err.message
                ctx.app.emit('error', err, ctx)
            }
        }
    }

    jwtMiddleWare() {
        let getToken = this.getToken
        return async (ctx: Context, next: Next) => {
            const token = getToken(ctx)
            if (!token) {
                ctx.status = httpConstants.HTTP_UNAUTHORISED
                ctx.body = { error: { code: 'GEN-UNAUTHORIZED', http_code: 401 } }
                return
            }
            let decoded = null
            try {
                decoded = decode(token, JWT_CONFIG.token)
                // ctx.state.user = decoded

                // The client's session has expired and must log in again.
                if (decoded.exp < Date.now()) {
                    ctx.status = httpConstants.HTTP_UNAUTHORISED
                    ctx.body = { error: { code: 'GEN-UNAUTHORIZED', http_code: 401 } }
                    return
                }
                // return next()
                // here will be the project specific code to check information inside the token
                

                ctx.state.openId = decoded.uid
                if (!ctx.state.openId) {
                    throw new Error()
                }
                await next()
            } catch (err) {
                ctx.status = httpConstants.HTTP_UNAUTHORISED
                ctx.body = { error: { code: 'GEN-UNAUTHORIZED', http_code: 401 } }
            }
        }
    }
}

const errorMiddleware: ErrorMiddleware = new ErrorMiddleware()
export default errorMiddleware
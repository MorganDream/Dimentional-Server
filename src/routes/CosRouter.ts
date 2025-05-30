import { RouterManager } from "../core/RouterManager"
import cosController from "../controllers/cos"
import errorMiddleware from "../core/middleware/ErrorMiddleware"

const cosRouterManager: RouterManager = new RouterManager('/cos')

cosRouterManager.get('/getAuth', errorMiddleware.jwtMiddleWare(), cosController.getAuthorization)

export default cosRouterManager
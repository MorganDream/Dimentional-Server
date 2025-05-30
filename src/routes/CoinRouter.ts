import { RouterManager } from '../core/RouterManager'
import coinController from '../controllers/coin'
import errorMiddleware from '../core/middleware/ErrorMiddleware'

const coinRouterManager: RouterManager = new RouterManager('/coin')

coinRouterManager.get('/', errorMiddleware.jwtMiddleWare(), coinController.get);
coinRouterManager.get('/list', errorMiddleware.jwtMiddleWare(), coinController.getCoins);
coinRouterManager.post('/subscribe', errorMiddleware.jwtMiddleWare(), coinController.subscribe);
coinRouterManager.post('/share', errorMiddleware.jwtMiddleWare(), coinController.share);

export default coinRouterManager
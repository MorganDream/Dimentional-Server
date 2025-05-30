import { RouterManager } from '../core/RouterManager'
import errorMiddleware from '../core/middleware/ErrorMiddleware'
import notificationController from '../controllers/notification'

const notificationRouterManager: RouterManager = new RouterManager('/notification')

notificationRouterManager.get('/', errorMiddleware.jwtMiddleWare(), notificationController.get);

notificationRouterManager.get('/comments', errorMiddleware.jwtMiddleWare(), notificationController.getComments);

notificationRouterManager.get('/likes', errorMiddleware.jwtMiddleWare(), notificationController.getLikes);

notificationRouterManager.get('/fans', errorMiddleware.jwtMiddleWare(), notificationController.getFans);

notificationRouterManager.get('/yopaPositions', errorMiddleware.jwtMiddleWare(), notificationController.getYopaPositions);

notificationRouterManager.post('/comments', errorMiddleware.jwtMiddleWare(), notificationController.readComments);

notificationRouterManager.post('/likes', errorMiddleware.jwtMiddleWare(), notificationController.readLike);

notificationRouterManager.post('/fans', errorMiddleware.jwtMiddleWare(), notificationController.readFans);

notificationRouterManager.post('/', errorMiddleware.jwtMiddleWare(), notificationController.read);

export default notificationRouterManager

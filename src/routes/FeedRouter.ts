import { RouterManager } from '../core/RouterManager'
import feedController from '../controllers/feed'
import errorMiddleware from '../core/middleware/ErrorMiddleware';

const feedRouterManager: RouterManager = new RouterManager('/feed')

feedRouterManager.post('/',  errorMiddleware.jwtMiddleWare(), feedController.post);

feedRouterManager.get('/', 
    errorMiddleware.jwtMiddleWare(), 
    feedController.getAllFeeds);

feedRouterManager.get('/detail', errorMiddleware.jwtMiddleWare(), feedController.getFeedDetail);

feedRouterManager.post('/like', errorMiddleware.jwtMiddleWare(), feedController.like);

export default feedRouterManager

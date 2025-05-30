import { RouterManager } from '../core/RouterManager'
import yopaController from '../controllers/yopa'
import errorMiddleware from '../core/middleware/ErrorMiddleware'

const yopaRouterManager: RouterManager = new RouterManager('/yopa')

yopaRouterManager.post('/',errorMiddleware.jwtMiddleWare(), yopaController.post);

yopaRouterManager.get('/', errorMiddleware.jwtMiddleWare(), yopaController.getAll);

yopaRouterManager.get('/detail', errorMiddleware.jwtMiddleWare(), yopaController.getDetail);

yopaRouterManager.post('/like', errorMiddleware.jwtMiddleWare(), yopaController.like);

yopaRouterManager.post('/position', errorMiddleware.jwtMiddleWare(), yopaController.applyForPosition);

yopaRouterManager.delete('/position', errorMiddleware.jwtMiddleWare(), yopaController.canclePositionApplication);

yopaRouterManager.post('/settlePosition', errorMiddleware.jwtMiddleWare(), yopaController.settlePosition);

yopaRouterManager.delete('/settlePosition', errorMiddleware.jwtMiddleWare(), yopaController.cancelSettlePosition);

yopaRouterManager.post('/lock', errorMiddleware.jwtMiddleWare(), yopaController.lock);

yopaRouterManager.post('/unLock', errorMiddleware.jwtMiddleWare(), yopaController.unLock);

yopaRouterManager.get('/applied', errorMiddleware.jwtMiddleWare(), yopaController.getYopasIApplied);


export default yopaRouterManager
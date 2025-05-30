import { RouterManager } from '../core/RouterManager'
import errorMiddleware from '../core/middleware/ErrorMiddleware'
import commentController from '../controllers/comment'

const commentRouterManager: RouterManager = new RouterManager('/comment')

commentRouterManager.post('/', errorMiddleware.jwtMiddleWare(), commentController.post);

export default commentRouterManager


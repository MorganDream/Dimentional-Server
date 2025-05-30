import { RouterManager } from '../core/RouterManager'
import userController from '../controllers/user'
import errorMiddleware from '../core/middleware/ErrorMiddleware';

const userRouterManager: RouterManager = new RouterManager('/user')

userRouterManager.post('/', errorMiddleware.jwtMiddleWare(), userController.newUser);

userRouterManager.put('/', errorMiddleware.jwtMiddleWare() ,userController.updateMyInfo);

userRouterManager.get('/', errorMiddleware.jwtMiddleWare(), userController.getMyInfo);

userRouterManager.get('/findTheOne', errorMiddleware.jwtMiddleWare(), userController.findTheOne);

userRouterManager.get('/fansfollowed', errorMiddleware.jwtMiddleWare(), userController.getFansFollowedNum);

userRouterManager.get('/followedUsers', errorMiddleware.jwtMiddleWare(), userController.getFollowedUsers);

userRouterManager.get('/fans', errorMiddleware.jwtMiddleWare(), userController.getFans);

userRouterManager.get('/:id', errorMiddleware.jwtMiddleWare(), userController.getUser);

userRouterManager.get('/detail/:id', errorMiddleware.jwtMiddleWare(), userController.getUserDetail);

userRouterManager.post('/follow', errorMiddleware.jwtMiddleWare(), userController.followUser);

userRouterManager.post('/unFollow', errorMiddleware.jwtMiddleWare(), userController.unFollowUser);

export default userRouterManager
import { RouterManager } from '../core/RouterManager'
import authController from '../controllers/auth'

const authRouterManager: RouterManager = new RouterManager('/auth')

authRouterManager.get('/login', authController.login)

export default authRouterManager


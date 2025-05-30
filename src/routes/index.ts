import * as Koa from 'koa'
import RouterGenerator from '../core/RouterGenerator'

// router loader function for loading the routes of specific module
export default (app: Koa) => {
    const dirPath: string = __dirname
    let baseUrl: string = '/api/v1';

    // router generator will generate routes
    const routerGenerator: RouterGenerator = new RouterGenerator(dirPath, baseUrl)

    // generating the routes of specific module
    routerGenerator.generateRoute(app)
}
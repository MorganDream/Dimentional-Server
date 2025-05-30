import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import http2 from 'http2'
import fs from 'fs'
import routes from './routes'
import errorMiddleware from './core/middleware/ErrorMiddleware'
import { SERVER_CONFIG } from './config'
import initDB from './database/init'
import websockify from 'koa-websocket'

initDB()

const app: Koa = new Koa()

// Loading certificates
const options: http2.SecureServerOptions = {
    cert: fs.readFileSync(`${process.cwd()}/cert/yopa.club.crt`),
    key: fs.readFileSync(`${process.cwd()}/cert/yopa.club.key`),
    allowHTTP1: true
}


app.use(bodyParser())

// 登陆验证
app.use(errorMiddleware.errorMiddleware())
// app.use(errorMiddleware.jwtMiddleWare())
routes(app)
// app.listen(SERVER_CONFIG.port)


http2
    .createSecureServer(options, app.callback())
    .listen(443, () => {
        console.log(`Server started on ${443}`)
    })


// // wss
// const wssApp = websockify(new Koa(), {}, options);

// wssApp.ws.use(bodyParser())

// // 登陆验证
// wssApp.ws.use(errorMiddleware.errorMiddleware())
// // app.use(errorMiddleware.jwtMiddleWare())
// wssApp.ws.use((ctx) => {
//     // the websocket is added to the context as `ctx.websocket`.
//    ctx.websocket.on('message', function(message) {
//        console.log(ctx.href);
//      console.log(message);
//    });
//  });
// // app.listen(SERVER_CONFIG.port)


// wssApp.listen(3000);


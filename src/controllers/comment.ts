import { Context } from "koa";
import commentService from "../service/commentService";
import httpConstants from "../constant/httpConstants";

class CommentController {
    async post(ctx: Context) {
        const comment = await commentService.post(ctx);
        ctx.body = {
            comment
        };
        ctx.status = httpConstants.HTTP_CREATED;
    }
}

let commentController = new CommentController();
export default commentController;
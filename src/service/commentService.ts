import { Context } from "koa";
import { Comment, Feed, Yopa } from "../database/models";
import notificationService from "./notificationService";

class CommentService {
    async post(ctx: Context) {
        const fromOpenId = ctx.state.openId;
        const { feedId, yopaId, parentId, replyToOpenId, text, image } = ctx.request.body;
        let comment: Comment;
        if (parentId) {
            const parentComment = await Comment.findByPk(parentId);
            comment = await parentComment.createComment({
                fromOpenId,
                replyToOpenId,
                text,
                image
            })
        } else if(feedId) {
            const feed = await Feed.findByPk(feedId);
            comment = await feed.createComment({
                fromOpenId,
                text,
                image
            });
        } else if(yopaId) {
            const yopa = await Yopa.findByPk(yopaId);
            comment = await yopa.createComment({
                fromOpenId,
                text,
                image
            });
        }
        notificationService.createFromComment(comment);
        return comment;
    }

    public async getComments( parent: Feed | Comment) {
        return parent.getComments({
            include: [{
                association: Comment.associations.comments,
                as: 'comments'
            }]
        })
    }
}

let commentService = new CommentService();
export default commentService;
import { Context } from "koa";
import userService from "../service/userService";
import httpConstants from "../constant/httpConstants";
import { User } from "../database/models";
import notificationService from "../service/notificationService";

class UserController {
    async newUser(ctx: Context) {
        const user = await userService.addUser(ctx);
        ctx.body = {
            openId: user.openId
        };
        ctx.status = httpConstants.HTTP_CREATED;
    }

    async getMyInfo(ctx: Context) {
        const user = await User.findByPk(ctx.state.openId, {
            include: [{
                association: User.associations.roles,
                as: 'roles'
            }, {
                association: User.associations.location,
                as: 'location'
            }]
        });
        if (user === null) {
            ctx.status = httpConstants.HTTP_REQUESTED_RESOURCE_NOT_FOUND;
        } else {
            ctx.body = {
                user
            }
        }
    }

    async getUser(ctx: Context) {
        try {
            const user = await userService.getUserDetail(ctx);
            if (user === null) {
                ctx.status = httpConstants.HTTP_REQUESTED_RESOURCE_NOT_FOUND;
            } else {
                const hasFollowed = await userService.getHasFollowed(ctx.state.openId, ctx.params.id);
                const isMyFan = await userService.getIsMyFan(ctx.state.openId, ctx.params.id);
                ctx.body = {
                    user,
                    hasFollowed,
                    isMyFan
                }
            }
        } catch(e) {
            ctx.status = httpConstants.HTTP_INTERNAL_SERVER_ERROR;
            ctx.body = {
                error: e
            }
        }
    }

    async findTheOne(ctx: Context) {
        try {
            const openId = await userService.findTheOne(ctx);
            ctx.body = {
                openId
            }
        } catch(e) {
            ctx.status = httpConstants.HTTP_INTERNAL_SERVER_ERROR;
            ctx.body = {
                error: e
            }
        }
    }

    async updateMyInfo(ctx: Context) {
        await userService.updateUser(ctx);
        ctx.status = httpConstants.HTTP_SUCCESS_OK;
    }

    async followUser(ctx: Context) {
        await userService.followUser(ctx);
        ctx.status = httpConstants.HTTP_SUCCESS_OK;
    }

    async unFollowUser(ctx: Context) {
        await userService.unFollowUser(ctx);
        ctx.status = httpConstants.HTTP_SUCCESS_OK;
    }

    async getUserDetail(ctx: Context) {
        const user = await userService.getUserDetail(ctx);
        ctx.status = httpConstants.HTTP_SUCCESS_OK;
        ctx.body = {
            user
        };
    }

    async getFollowedUsers(ctx: Context) {
        try {
            const followedUsers = await userService.getFollowedUsers(ctx);
            ctx.status = httpConstants.HTTP_SUCCESS_OK;
            ctx.body = {
                followedUsers
            };
        } catch(err) {
            ctx.body = {
                error: err
            };
            ctx.status = httpConstants.HTTP_INTERNAL_SERVER_ERROR;
        }
    }

    async getFans(ctx: Context) {
        try {
            const { fans, newFanIds, notificationIds } = await userService.getFans(ctx);
            ctx.status = httpConstants.HTTP_SUCCESS_OK;
            ctx.body = {
                fans, 
                newFanIds
            };
            if (notificationIds) {
                notificationService.readNotifications(ctx.state.openId, notificationIds);
            }
        } catch(err) {
            ctx.body = {
                error: err
            };
            ctx.status = httpConstants.HTTP_INTERNAL_SERVER_ERROR;
        }
    }

    async getFansFollowedNum(ctx: Context) {
        try {
            const data = await userService.getFansFollowedNum(ctx);
            ctx.status = httpConstants.HTTP_SUCCESS_OK;
            ctx.body = data;
        } catch(err) {
            ctx.body = {
                error: err
            };
            ctx.status = httpConstants.HTTP_INTERNAL_SERVER_ERROR;
        }
    }
}

const userController: UserController = new UserController()
export default userController 
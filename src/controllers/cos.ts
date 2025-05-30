import STS from 'qcloud-cos-sts';
import { COS_CONFIG } from '../config';
import { Context } from 'koa';
import CosAuth from '../util/cos-auth';
import httpConstants from '../constant/httpConstants';

interface STSCredential {
    credentials: {
        tmpSecretId: string;
        tmpSecretKey: string;
        sessionToken: string;
    },
    expiration: string
    startTime: number;
    expiredTime: number;
}

const getAuth = async (config: object) => {
    return new Promise<STSCredential>((resolve, reject) => {
        STS.getCredential(config, function(err: object, credential: STSCredential) {
            if (err) {
                reject(err);
            } else {
                resolve(credential);
            }
        });
    })
}

class CosController {
    async getAuthorization(ctx: Context) {
        try {
            const credential = await getAuth(COS_CONFIG);
            const { method, pathName } = ctx.query;
            const { credentials } = credential;
            ctx.body = {
                xCosSecurityToken: credentials.sessionToken,
                authorization: CosAuth({
                    SecretId: credentials.tmpSecretId,
                    SecretKey: credentials.tmpSecretKey,
                    Method: method,
                    Pathname: pathName,
                })
            }
            ctx.status = httpConstants.HTTP_SUCCESS_OK;
        } catch(err) {
            ctx.body = err;
            ctx.status = httpConstants.HTTP_INTERNAL_SERVER_ERROR;
        }
    }
}

const cosController: CosController = new CosController()
export default cosController 
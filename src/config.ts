import { Options } from "sequelize"

export const JWT_CONFIG = {
    token: process.env.TOKEN || 'secret-jwt-token',
    expire: 1000 * 60 * 60 * 24 * 7
}

export const SERVER_CONFIG = {
    environment: 'development' || process.env.NODE_ENV,
    baseUrl: '/api/v1',
    port: 443
}

export const DB_CONFIG: Options = {
    database : 'xxx',
    username: 'xx',
    password: 'xxxx',
    host: 'xxxx',
    port: 111,
    dialect: 'mysql'
}

export const QQ_CONFIG = {
    appid: 11111,
    appsecret: 'xxx',
    granttype: 'authorization_code'
}

export const COS_CONFIG = {
    secretId: 'xxx',
    secretKey: 'xxx',
    policy: {
        "statement": [
          {
            "principal": {
              "qcs": [
                "qcs::cam::anyone:anyone"
              ]
            },
            "effect": "allow",
            "action": [
              "name/cos:*"
            ],
            "resource": [
              "qcs::cos:ap-shanghai:uid/1300638537:yopa-images-1300638537/*"
            ]
          }
        ],
        "version": "2.0"
    },
    durationSeconds: 1800
};

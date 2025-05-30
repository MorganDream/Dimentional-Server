import { Model, DataTypes } from "sequelize";
import { sequelize } from "../basic";

export enum CoinAction {
    FIRST_LOGIN = 'FIRST_LOGIN',
    DAILY_SIGNIN = 'DAILY_SIGNIN',
    SHARE = 'SHARE',
    COMPLETE_PERSONAL_INFO = 'COMPLETE_PERSONAL_INFO',
    SUBSCRIBE = 'SUBSCRIBE',
    POST = 'POST',
    APPLY = 'APPLY',
    SETTLE_POSITION = 'SETTLE_POSITION'
}

export const CoinValue = new Map<CoinAction, number>([
    [CoinAction.FIRST_LOGIN, 10],
    [CoinAction.DAILY_SIGNIN, 1],
    [CoinAction.SHARE, 3],
    [CoinAction.COMPLETE_PERSONAL_INFO, 5],
    [CoinAction.SUBSCRIBE, 5],
    [CoinAction.POST, -2],
    [CoinAction.APPLY, -3],
    [CoinAction.SETTLE_POSITION, -1]
]);

export class Coin extends Model {
    public id!: number;
    public action!: CoinAction;
    public change!: number;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export const initCoin = function() {
    Coin.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
        action: {
            type: new DataTypes.STRING(100),
            allowNull: false
        },
        change: {
            type: DataTypes.INTEGER,

        }
    }, {
        sequelize,
        tableName: 'coin',
    });
}
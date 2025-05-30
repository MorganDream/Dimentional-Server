import { Model } from "sequelize";
import { sequelize } from "../../basic";

export class UserYopaPosition extends Model {}
export function initUserYopaPosition() {
    UserYopaPosition.init({}, { sequelize, tableName: 'userYopaPosition', });
}
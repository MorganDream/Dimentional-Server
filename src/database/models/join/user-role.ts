import { Model } from "sequelize";
import { sequelize } from "../../basic";

export class UserRole extends Model {}
export function initUserRole() {
    UserRole.init({}, { sequelize, tableName: 'userRole', });
}
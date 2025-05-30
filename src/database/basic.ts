import { Sequelize } from "sequelize";
import { DB_CONFIG } from "../config";

export const sequelize = new Sequelize(DB_CONFIG);

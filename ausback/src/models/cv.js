import { DataTypes } from "sequelize"
import sequelize from "../database/database.js"

export const Cv = sequelize.define('cvs', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        },
    name:{type: DataTypes.STRING,allowNull: true},
    email:{type: DataTypes.STRING,allowNull: true},
    phone:{type: DataTypes.STRING,allowNull: true},
    file:{type: DataTypes.STRING,allowNull: true},
})
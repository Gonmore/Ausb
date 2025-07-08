import { DataTypes } from "sequelize"
import sequelize from "../database/database.js"

export const Profamily = sequelize.define('profamilys', {
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name:{type: DataTypes.STRING,allowNull: true},
    description:{type: DataTypes.STRING,allowNull: true}
})
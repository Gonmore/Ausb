import { DataTypes } from "sequelize"
import sequelize from "../database/database.js"

export const Student = sequelize.define('students', {
    id:{
        type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true,
    },
    grade:{
        type: DataTypes.STRING,allowNull: false,
        validate:{notNull:{ msg:'Grade must not be null'}},
    },
    course:{
        type: DataTypes.STRING,allowNull: false,
        validate:{notNull:{ msg:'Course must not be null' }}
    },
    double:{type: DataTypes.BOOLEAN, defaultValue:false},
    car:{type: DataTypes.BOOLEAN, defaultValue:false},
    active:{type: DataTypes.BOOLEAN, defaultValue:true},
    tag:{type: DataTypes.STRING, allowNull: true},
    description:{type: DataTypes.STRING, allowNull:true},
    disp:{
        type: DataTypes.DATEONLY,allowNull: false,
        validate:{notNull:{ msg:'Disp must not be null'}},
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },       
})


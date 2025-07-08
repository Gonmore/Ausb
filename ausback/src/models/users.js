import { DataTypes } from "sequelize"
import sequelize from "../database/database.js"
import { Status } from "../constants/index.js"
import { encriptar } from "../common/bcrypt.js"
import logger from '../logs/logger.js'



export const User = sequelize.define('users', {
    id:{type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true,
    },
    username:{
        type: DataTypes.STRING, allowNull: false,
        validate:{notNull:{ msg: 'Username must not be null'}},
    },
    email: { type: DataTypes.STRING,allowNull: true,unique: true,
    },
    password:{type: DataTypes.STRING,allowNull: true,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'student',
        validate: {
            isIn: {
                args: [['student', 'company', 'scenter', 'tutor', 'admin']],
                msg: 'Role must be student, company, scenter, tutor, or admin'
            }
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    surname: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    googleId: {type: DataTypes.STRING,unique: true,allowNull: true,
    },
    facebookId: {type: DataTypes.STRING, unique: true,allowNull: true,
    },
    image: {type: DataTypes.STRING,allowNull: true,
    },
    status: {type: DataTypes.STRING,defaultValue: Status.ACTIVE,
        validate: {
            isIn:{
                args: [[Status.ACTIVE], [Status.INACTIVE]],
                msg: 'Status must be active or inactive',
            },
        },
    },

})
//Abajo la encipcion del password al crear o actualizar
User.beforeCreate(async (user) => {
    if (user.password) { // Verifica si el usuario tiene una contraseña
        try {
            user.password = await encriptar(user.password);
        } catch (error) {
            logger.error(error.message);
            throw new Error('Error al crear contraseña');
        }
    }
});

User.beforeUpdate(async (user) => {
    if (user.password) { // Verifica si el usuario tiene una contraseña
        try {
            user.password = await encriptar(user.password);
        } catch (error) {
            logger.error(error.message);
            throw new Error('Error al actualizar contraseña');
        }
    }
});



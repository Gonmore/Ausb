import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";

export const Application = sequelize.define('applications', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    offerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'offers',
            key: 'id'
        }
    },
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'students',
            key: 'id'
        }
    },
    companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'companies',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'reviewed', 'accepted', 'rejected', 'withdrawn'),
        defaultValue: 'pending',
        allowNull: false
    },
    appliedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Mensaje del estudiante al aplicar'
    },
    companyNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Notas internas de la empresa'
    },
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Razón del rechazo si aplica'
    }
});

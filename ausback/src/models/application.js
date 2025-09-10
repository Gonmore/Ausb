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
    status: {
        type: DataTypes.ENUM(
            'pending', 
            'reviewed', 
            'interview_requested',  // 🔥 AGREGAR ESTE VALOR
            'accepted', 
            'rejected', 
            'withdrawn'
        ),
        allowNull: false,
        defaultValue: 'pending'
    },
    appliedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    cvViewed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Si la empresa ya vio el CV del candidato'
    },
    cvViewedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Cuándo la empresa vio el CV'
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

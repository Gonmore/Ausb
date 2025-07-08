import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";

export const CompanyToken = sequelize.define('company_tokens', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'companies',
            key: 'id'
        }
    },
    tokenBalance: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: 'Cantidad de tokens disponibles'
    },
    tokensUsed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: 'Tokens gastados'
    },
    lastRecharge: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Última vez que se recargaron tokens'
    },
    rechargeAmount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Cantidad de la última recarga'
    }
});

// Modelo para el historial de uso de tokens
export const TokenUsage = sequelize.define('token_usage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'companies',
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
    tokensUsed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Tokens gastados en esta consulta'
    },
    action: {
        type: DataTypes.STRING,  // Cambiar de ENUM a STRING temporalmente
        allowNull: false,
        comment: 'Tipo de acción que consumió tokens'
    },
    usedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

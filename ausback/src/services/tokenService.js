import { Token, TokenTransaction, Company } from '../models/relations.js';
import sequelize from '../database/database.js';

export class TokenService {
    
    // Obtener balance de tokens de una empresa
    static async getCompanyTokens(companyId) {
        try {
            let tokenRecord = await Token.findOne({
                where: { companyId }
            });

            // Si no existe el registro, crearlo con tokens iniciales
            if (!tokenRecord) {
                tokenRecord = await Token.create({
                    companyId,
                    amount: 10, // 10 tokens gratis iniciales
                    usedAmount: 0,
                    purchasedAmount: 10
                });

                // Registrar transacción inicial
                await TokenTransaction.create({
                    companyId,
                    type: 'purchase',
                    action: 'buy_tokens',
                    amount: 10,
                    description: 'Tokens gratuitos de bienvenida',
                    balanceAfter: 10
                });
            }

            return tokenRecord;
        } catch (error) {
            console.error('Error obteniendo tokens:', error);
            throw error;
        }
    }

    // Usar tokens
    static async useTokens(companyId, amount, action, studentId = null, description = '') {
        const transaction = await sequelize.transaction();
        
        try {
            const tokenRecord = await this.getCompanyTokens(companyId);

            if (tokenRecord.amount < amount) {
                throw new Error('Tokens insuficientes');
            }

            // Actualizar balance
            await tokenRecord.update({
                amount: tokenRecord.amount - amount,
                usedAmount: tokenRecord.usedAmount + amount
            }, { transaction });

            // Registrar transacción
            await TokenTransaction.create({
                companyId,
                studentId,
                type: 'usage',
                action,
                amount: -amount,
                description,
                balanceAfter: tokenRecord.amount - amount
            }, { transaction });

            await transaction.commit();
            return tokenRecord.amount - amount; // Nuevo balance
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // Comprar tokens
    static async purchaseTokens(companyId, amount, paymentInfo = {}) {
        const transaction = await sequelize.transaction();
        
        try {
            const tokenRecord = await this.getCompanyTokens(companyId);

            // Actualizar balance
            await tokenRecord.update({
                amount: tokenRecord.amount + amount,
                purchasedAmount: tokenRecord.purchasedAmount + amount,
                lastPurchaseDate: new Date()
            }, { transaction });

            // Registrar transacción
            await TokenTransaction.create({
                companyId,
                type: 'purchase',
                action: 'buy_tokens',
                amount: amount,
                description: `Compra de ${amount} tokens`,
                balanceAfter: tokenRecord.amount + amount
            }, { transaction });

            await transaction.commit();
            return tokenRecord.amount + amount; // Nuevo balance
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // Obtener historial de transacciones
    static async getTransactionHistory(companyId, limit = 50) {
        try {
            return await TokenTransaction.findAll({
                where: { companyId },
                include: [
                    {
                        model: Student,
                        as: 'student',
                        required: false,
                        include: [
                            {
                                model: User,
                                attributes: ['name', 'surname', 'email']
                            }
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']],
                limit
            });
        } catch (error) {
            console.error('Error obteniendo historial:', error);
            throw error;
        }
    }
}
import { Token, TokenTransaction, Company, RevealedCV } from '../models/relations.js';
import sequelize from '../database/database.js';
import logger from '../logs/logger.js';

export class TokenService {
    
    // Obtener balance de tokens de una empresa
    static async getCompanyTokens(companyId) {
        try {
            let token = await Token.findOne({
                where: { companyId }
            });

            if (!token) {
                // Crear registro inicial con 10 tokens gratis
                token = await Token.create({
                    companyId: companyId,
                    amount: 10,
                    usedAmount: 0,
                    purchasedAmount: 10
                });
            }

            return {
                available: token.amount,
                used: token.usedAmount,
                total: token.purchasedAmount
            };
        } catch (error) {
            logger.error('Error getCompanyTokens:', error);
            throw error;
        }
    }

    // Verificar si un CV ya fue revelado
    static async isCVRevealed(companyId, studentId) {
        try {
            const revealed = await RevealedCV.findOne({
                where: {
                    companyId: companyId,
                    studentId: studentId
                }
            });
            return !!revealed;
        } catch (error) {
            logger.error('Error checking revealed CV:', error);
            throw error;
        }
    }

    // Usar tokens con persistencia para CVs revelados
    static async useTokens(companyId, amount, action, studentId = null, description = '') {
        try {
            // 🔥 USAR VALORES CORRECTOS DEL ENUM
            const validActions = {
                'view_cv_ai': 'view_cv',        // Mapear a valor válido
                'contact_student_ai': 'contact_student'  // Mapear a valor válido
            };
            
            const dbAction = validActions[action] || action;
            
            // 🔥 ACCIONES QUE REVELAN AL ESTUDIANTE
            const revealActions = ['view_cv_ai', 'contact_student_ai'];
            
            // Si es una acción de revelar estudiante, verificar si ya fue revelado
            if (revealActions.includes(action) && studentId) {
              const alreadyRevealed = await this.isCVRevealed(companyId, studentId);
              if (alreadyRevealed) {
                console.log(`✅ Estudiante ${studentId} ya fue revelado, acceso gratuito`);
                return { wasAlreadyRevealed: true, newBalance: null };
              }
            }

            // Obtener o crear registro de tokens
            let token = await Token.findOne({
              where: { companyId }
            });

            if (!token) {
              token = await Token.create({
                companyId: companyId,
                amount: 10,
                usedAmount: 0,
                purchasedAmount: 10
              });
            }

            // Verificar si hay tokens suficientes
            if (token.amount < amount) {
              throw new Error('Tokens insuficientes');
            }

            // Actualizar balance
            const newBalance = token.amount - amount;
            const newUsedAmount = token.usedAmount + amount;

            await token.update({
              amount: newBalance,
              usedAmount: newUsedAmount
            });

            // 🔥 REGISTRAR TRANSACCIÓN CON VALOR VÁLIDO DEL ENUM
            await TokenTransaction.create({
              companyId: companyId,
              studentId: studentId,
              type: 'usage',
              action: dbAction,  // 🔥 USAR VALOR MAPEADO
              amount: -amount,
              description: description,
              balanceAfter: newBalance
            });

            // 🔥 SI ES UNA ACCIÓN DE REVELAR, MARCAR AL ESTUDIANTE COMO REVELADO
            if (revealActions.includes(action) && studentId) {
              await RevealedCV.create({
                companyId: companyId,
                studentId: studentId,
                tokensUsed: amount,
                revealType: 'intelligent_search'
              });
              console.log(`💾 Estudiante ${studentId} marcado como revelado completamente`);
            }

            console.log(`💳 Tokens usados: ${amount}, nuevo balance: ${newBalance}`);
            return { wasAlreadyRevealed: false, newBalance: newBalance };

        } catch (error) {
            console.error('Error useTokens:', error);
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

    // Obtener CVs revelados por una empresa
    static async getRevealedCVs(companyId) {
        try {
            const revealedCVs = await RevealedCV.findAll({
                where: { companyId },
                attributes: ['studentId', 'revealedAt', 'tokensUsed'],
                order: [['revealedAt', 'DESC']]
            });

            return revealedCVs.map(cv => cv.studentId);
        } catch (error) {
            logger.error('Error getRevealedCVs:', error);
            throw error;
        }
    }
}
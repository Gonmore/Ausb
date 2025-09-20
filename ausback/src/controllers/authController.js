import jwt from 'jsonwebtoken';
import { User } from '../models/relations.js';
import { Op } from 'sequelize';
import logger from '../logs/logger.js';

class AuthController {
    async register(req, res) {
        try {
            const { username, email, password, role, name, surname, phone, description, countryCode, cityId } = req.body;

            console.log('=== DEBUG REGISTRO ===');
            console.log('1. Datos recibidos:', { username, email, role, name, surname, phone, countryCode, cityId });
            
            // Validaciones básicas
            if (!username || !email || !password || !role) {
                return res.status(400).json({
                    success: false,
                    message: 'Campos obligatorios faltantes'
                });
            }

            console.log('2. Validaciones básicas: OK');

            // Verificar si el usuario ya existe
            const existingUser = await User.findOne({
                where: {
                    [Op.or]: [{ email }, { username }]
                }
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'El usuario o email ya existe'
                });
            }

            console.log('3. Usuario no existe: OK');

            // Datos para crear usuario
            const userData = {
                username,
                email,
                password, // Sin hashear - que lo haga el modelo
                role,
                name: name || null,
                surname: surname || null,
                phone: phone || null,
                description: description || null,
                countryCode: countryCode || null,
                cityId: cityId || null,
                active: true,
                status: 'active'
            };

            console.log('4. UserData preparado:', { ...userData, password: '[HIDDEN]' });

            // Aquí es donde probablemente falla
            console.log('5. Intentando crear usuario...');
            const user = await User.create(userData);
            console.log('6. Usuario creado:', { id: user.id });
            

            // Si llegamos aquí, el usuario se creó bien
            const token = jwt.sign({
                userId: user.id,
                role: user.role,
                email: user.email,
                username: user.username
            }, process.env.JWT_SECRET, { expiresIn: '7d' });

            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    name: user.name,
                    surname: user.surname,
                    phone: user.phone,
                    countryCode: user.countryCode,
                    cityId: user.cityId,
                    needsOnboarding: true
                }
            });

        } catch (error) {
            console.error('=== ERROR COMPLETO ===');
            console.error('Message:', error.message);
            console.error('Name:', error.name);
            console.error('Stack:', error.stack);
            console.error('SQL:', error.sql);
            console.error('Original:', error.original);
            
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email y contraseña son requeridos'
                });
            }

            const user = await User.findOne({ where: { email } });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Usar bcrypt directamente por ahora
            const bcrypt = await import('bcrypt');
            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            const token = jwt.sign({
                userId: user.id,
                role: user.role,
                email: user.email,
                username: user.username
            }, process.env.JWT_SECRET, { expiresIn: '7d' });

            res.json({
                success: true,
                message: 'Login exitoso',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    name: user.name,
                    surname: user.surname,
                    phone: user.phone,
                    countryCode: user.countryCode,
                    cityId: user.cityId
                }
            });

        } catch (error) {
            console.error('Error during login:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}

// ⚠️ CAMBIAR LA EXPORTACIÓN
const authController = new AuthController();
export default authController;

// O alternativamente, exporta las funciones directamente:
// export const register = (req, res) => new AuthController().register(req, res);
// export const login = (req, res) => new AuthController().login(req, res);
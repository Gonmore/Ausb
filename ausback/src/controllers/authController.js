import { User } from '../models/users.js';
import { Student } from '../models/student.js';
import { Company } from '../models/company.js';
import { Op } from 'sequelize';
import logger from '../logs/logger.js';
import { comparar, encriptar } from '../common/bcrypt.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { parsePhoneNumber } from 'libphonenumber-js';

async function login (req, res, next) {
    try{
        const { username, email, password } = req.body;
        
        // Buscar usuario por username o email
        const user = await User.findOne({ 
            where: { 
                [Op.or]: [
                    { username: username || email },
                    { email: email || username }
                ]
            }
        });
        
        if(!user) {
            logger.error('User not found')
            return res.status(404).json({ message:'Usuario no encontrado' });
        }
        if (!(await comparar(password, user.password))){
            logger.error('wrong password')
            return res.status(403).json({ message: 'Contraseña incorrecta' });
        }
        const secret = process.env.JWT_SECRET
        const seconds = process.env.JWT_EXPIRES_SECONDS
        const token = jwt.sign({userId: user.id}, secret, {expiresIn: eval(seconds)

        });
        
        // Siempre devolver JSON para peticiones API
        // Solo redirigir si es una petición de formulario HTML
        const isApiRequest = req.headers['content-type']?.includes('application/json') || 
                           req.headers['accept']?.includes('application/json') ||
                           !req.headers['user-agent']?.includes('Mozilla');
        
        if (isApiRequest) {
            res.json({ 
                token, 
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    name: user.name,
                    surname: user.surname,
                    phone: user.phone,
                    active: user.active
                }
            });
        } else {
            res.cookie('jwt', token, { httpOnly: true, secure: true, sameSite: 'strict' });
            res.redirect('/dashboard');
        }
    }catch(err){
        logger.error('Error login:'+err);
        res.status(500).json({message:'Error del servidor'});
    }
}

async function register(req, res, next) {
    try {
        const { 
            username, 
            email, 
            password, 
            role, 
            name, 
            surname, 
            phone, 
            description, 
            countryCode,  // 🔥 NUEVO
            cityId        // 🔥 NUEVO
        } = req.body;
        
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ 
            where: { 
                [Op.or]: [
                    { username },
                    { email }
                ]
            }
        });
        
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario o email ya existe' });
        }
        
        // Validar y formatear teléfono
        let formattedPhone = phone;
        let detectedCountryCode = countryCode;
        
        if (phone) {
            try {
                const phoneNumber = parsePhoneNumber(phone);
                if (phoneNumber && phoneNumber.isValid()) {
                    formattedPhone = phoneNumber.formatInternational();
                    
                    // Si no se proporcionó país, usar el detectado del teléfono
                    if (!countryCode && phoneNumber.country) {
                        detectedCountryCode = phoneNumber.country;
                    }
                }
            } catch (parseError) {
                logger.warn('Error parsing phone during registration:', parseError);
            }
        }
        
        // Crear el usuario
        const newUser = await User.create({
            username,
            email,
            password,
            role: role || 'student',
            name,
            surname,
            phone: formattedPhone,
            description,
            active: true,
            profileCompleted: false // 🔥 El onboarding determinará esto
        });
        
        // Crear registro específico según el rol
        if (newUser.role === 'student') {
            await Student.create({
                userId: newUser.id,
                grade: '1º',
                course: 'Por definir',
                disp: new Date()
            });
        } else if (newUser.role === 'company') {
            await Company.create({
                name: newUser.name || 'Empresa de Prueba',
                code: `EMP${newUser.id}`,
                address: 'Dirección de prueba',
                phone: newUser.phone || '123456789',
                email: newUser.email,
                description: newUser.description || 'Empresa dedicada a ofrecer prácticas profesionales',
                userId: newUser.id
            });
        }
        
        // Generar token
        const secret = process.env.JWT_SECRET;
        const seconds = process.env.JWT_EXPIRES_SECONDS;
        const token = jwt.sign({userId: newUser.id}, secret, {expiresIn: eval(seconds)});
        
        // Responder con token y datos del usuario
        res.status(201).json({ 
            token, 
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                name: newUser.name,
                surname: newUser.surname,
                phone: formattedPhone,
                profileCompleted: newUser.profileCompleted,
                active: newUser.active
            },
            detectedCountry: detectedCountryCode,
            message: 'Usuario registrado exitosamente'
        });
        
    } catch (err) {
        logger.error('Error register:' + err);
        res.status(500).json({ message: 'Error del servidor' });
    }
}

export default {
    login,
    register,
};
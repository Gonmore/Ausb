import { User } from '../models/users.js';
import { Student } from '../models/student.js';
import { Company } from '../models/company.js';
import { Op } from 'sequelize';
import logger from '../logs/logger.js';
import { comparar, encriptar } from '../common/bcrypt.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

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
        const token = jwt.sign({userId: user.id}, secret, {expiresIn: eval(seconds)});
        
        // Preparar datos del usuario para la respuesta
        let userData = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            name: user.name,
            surname: user.surname,
            phone: user.phone,
            active: user.active
        };
        
        // Si el usuario es una empresa, obtener la información de la empresa
        if (user.role === 'company') {
            try {
                const company = await Company.findOne({ where: { userId: user.id } });
                if (company) {
                    userData.company = {
                        id: company.id,
                        name: company.name,
                        code: company.code,
                        city: company.city,
                        sector: company.sector
                    };
                    userData.companyId = company.id; // Agregar companyId para fácil acceso
                }
            } catch (companyErr) {
                logger.warn('Could not fetch company info for user:', companyErr);
            }
        }
        
        // Si el usuario es un estudiante, obtener la información del estudiante
        if (user.role === 'student') {
            try {
                const student = await Student.findOne({ where: { userId: user.id } });
                if (student) {
                    userData.student = {
                        id: student.id,
                        profamilyId: student.profamilyId
                    };
                    userData.studentId = student.id; // Agregar studentId para fácil acceso
                }
            } catch (studentErr) {
                logger.warn('Could not fetch student info for user:', studentErr);
            }
        }
        
        // Siempre devolver JSON para peticiones API
        // Solo redirigir si es una petición de formulario HTML
        const isApiRequest = req.headers['content-type']?.includes('application/json') || 
                           req.headers['accept']?.includes('application/json') ||
                           !req.headers['user-agent']?.includes('Mozilla');
        
        if (isApiRequest) {
            res.json({ 
                token, 
                user: userData
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
        const { username, email, password, role, name, surname, phone, description } = req.body;
        
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
        
        // Crear el usuario (la contraseña se encriptará automáticamente por el hook)
        const newUser = await User.create({
            username,
            email,
            password, // Sin encriptar, se hace en el hook beforeCreate
            role: role || 'student',
            name,
            surname,
            phone,
            description,
            active: true
        });
        
        // Crear registro específico según el rol
        if (newUser.role === 'student') {
            await Student.create({
                userId: newUser.id,
                grade: '1º',
                course: 'Desarrollo Web',
                disp: new Date(),
                name: newUser.name,
                surname: newUser.surname,
                phone: newUser.phone,
                email: newUser.email
            });
        } else if (newUser.role === 'company') {
            const company = await Company.create({
                name: newUser.name || 'Empresa de Prueba',
                code: `EMP${newUser.id}`,
                address: 'Dirección de prueba',
                phone: newUser.phone || '123456789',
                email: newUser.email,
                description: newUser.description || 'Empresa dedicada a ofrecer prácticas profesionales'
            });
            
            // Crear la asociación en la tabla UserCompany
            await newUser.addCompany(company);
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
                phone: newUser.phone,
                active: newUser.active
            }
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
// app.js 
import 'dotenv/config'
import sequelize from './src/database/database.js'
import './src/models/relations.js'
import logger from './src/logs/logger.js'
import https from 'https';
import fs from 'fs-extra';
import express from 'express'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import SequelizeStore from 'connect-session-sequelize'
import passport from './passport-config.js'
import { morgan_dev_log, morgan_file_access } from './src/logs/morganConfig.js'
import adminRouter from './src/routes/adminRoutes.js'
import authRouter from './src/routes/authRoutes.js'
import userRouter from './src/routes/userRoutes.js'
import studentRouter from './src/routes/studentRoutes.js'
import scenterRouter from './src/routes/scenterRoutes.js'
import companyRouter from './src/routes/companyRoutes.js'
import userCompanyRouter from './src/routes/userCompanyRoutes.js'
import debugRouter from './src/routes/debugRoutes.js'
import offerRouter from './src/routes/offerRoutes.js'
import profamilyRouter from './src/routes/profamilyRoutes.js'
import tutorRouter from './src/routes/tutorRoutes.js'
import seedRouter from './src/routes/seedRoutes.js'
import applicationRouter from './src/routes/applicationRoutes.js'
import tokenRouter from './src/routes/tokenRoutes.js'
import adminTempRouter from './src/routes/adminRoutes.temp.js'
import swaggerDocs from './src/swagger.js'
import cors from 'cors';
import onboardingRoutes from './src/routes/onboardingRoutes.js';
import geographyRoutes from './src/routes/geographyRoutes.js';
import skillRoutes from './src/routes/skillRoutes.js';
// Skills API


const app = express();

// Configurar CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const port = process.env.PORT;

const options = {
  key: fs.readFileSync('./server.key'),
  cert: fs.readFileSync('./server.cert')
};

// Iniciando relaciones de DB 
sequelize.sync({force: false}).then(async () => {
  console.log("Base de datos sincronizada")
});

const SequelizeStoreSession = SequelizeStore(session.Store)

// Configurar middleware de sesión
app.use(session({
    secret: 'tu_secreto',
    resave: false,
    saveUninitialized: false,
    store: new SequelizeStoreSession({
      db: sequelize,
      tableName: 'Session',
    })
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser())
app.use(morgan_dev_log)
app.use(morgan_file_access)

// Admin routes
app.use(adminRouter);

// Auth routes
app.use(authRouter);
app.use('/login', authRouter);
app.use('/api/auth', authRouter);

// API routes
app.use('/api/users', userRouter);
app.use('/api/student', studentRouter);
app.use('/api/students', studentRouter);
app.use('/api/scenter', scenterRouter);
app.use('/api/company', companyRouter);
app.use('/api/user-company', userCompanyRouter);
app.use('/api/offers', offerRouter);
app.use('/api/profamilies', profamilyRouter);
app.use('/api/tutors', tutorRouter);
app.use('/api/applications', applicationRouter);
app.use('/api/tokens', tokenRouter);
app.use('/api/admin-temp', adminTempRouter);
app.use('/api/dev', seedRouter);
app.use('/api/debug', debugRouter);
app.use('/api/geography', geographyRoutes);
app.use('/api/skills', skillRoutes);

// Onboarding routes
app.use('/onboarding', onboardingRoutes);

// Static routes
app.get('/', (req, res) => { 
    res.send('¡Hola, Mundo!');
});

app.get('/privacy', (req, res) => { 
    res.send('Pagina de privacidad');
});

app.get('/terms', (req, res) => { 
    res.send('Terminos y condiciones');
});

app.get('/clear_user', (req, res) => { 
    res.send('Como eliminar tus datos de usuario');
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('🚨 GLOBAL ERROR HANDLER:', error);
    console.error('🚨 Stack trace:', error.stack);
    console.error('🚨 Request URL:', req.url);
    console.error('🚨 Request Method:', req.method);
    
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
});

// Servidor escuchando en el puerto
app.listen(port, () => { 
  console.log(`Aplicación escuchando en http://localhost:${port}`);
  logger.info(`Server started on port: ${port}`);
  swaggerDocs(app, port)
});
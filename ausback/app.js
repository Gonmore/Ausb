// app.js 
import 'dotenv/config'

import sequelize from './src/database/database.js'
import './src/models/relations.js' // Importar las relaciones
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

const app = express();

// Configurar CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Permitir ambos puertos del frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const port = process.env.PORT;

const options = {
  key: fs.readFileSync('./server.key'),
  cert: fs.readFileSync('./server.cert')
};

//Iniciando relaciones de DB 
sequelize.sync({force: false}).then(async () => {
  console.log("Base de datos sincronizada")})


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

// Para parsear datos de formularios (x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Usa la configuracion para authentication
app.use(passport.initialize());
app.use(passport.session());

//middleware necesario para acceder a las cookies
app.use(cookieParser())

//Usa la configuracion de Morgan
app.use(morgan_dev_log)
app.use(morgan_file_access)

// Usa el administrador en la ruta /admin
app.use(adminRouter);

// Usa las rutas de autenticación
app.use(authRouter);

// Usa las rutas de la API
app.use(express.json()); //para el body del post

//routes
app.use('/api/users', userRouter);
app.use('/api/student', studentRouter);
app.use('/api/scenter', scenterRouter);
app.use('/api/company', companyRouter);
app.use('/api/offers', offerRouter);
app.use('/api/profamilies', profamilyRouter);
app.use('/api/tutors', tutorRouter);
app.use('/api/applications', applicationRouter);
app.use('/api/tokens', tokenRouter);
app.use('/api/admin-temp', adminTempRouter);
app.use('/api/dev', seedRouter);
app.use('/login', authRouter);
app.use('/api/auth', authRouter);
app.use('/api/students', studentRouter); // Nueva ruta
app.use('/api/debug', debugRouter);

// Ruta de ejemplo 
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

// Servidor escuchando en el puerto 3000 
app.listen(port, () => { 
  console.log(`Aplicación escuchando en http://localhost:${port}`);
  logger.info(`Server started on port: ${port}`);
  logger.error('error');
  logger.warn('warn');
  logger.fatal('fatal');
  swaggerDocs(app, port)
});
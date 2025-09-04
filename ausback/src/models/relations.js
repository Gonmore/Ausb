import { User } from "./users.js";
import { Scenter } from "./scenter.js";
import { Tutor } from "./tutor.js";
import { Student } from "./student.js";
import { Company } from "./company.js";
import { Profamily } from "./profamily.js";
import { Offer } from "./offer.js";
import { Application } from "./application.js";
import { Cv } from "./cv.js";
import { Token } from "./token.js";
import { TokenTransaction } from "./tokenTransaction.js";
import { StudentToken } from "./studentToken.js"; // NUEVO

//Relaciones entre tablas

// Relación uno a muchos 
Scenter.hasMany(Tutor, { foreignKey: 'tutorId' });
Tutor.belongsTo(Scenter, { foreignKey: 'tutorId' });
Profamily.hasMany(Offer, { foreignKey: 'profamilyId' });
Offer.belongsTo(Profamily, { foreignKey: 'profamilyId' });

// Relación uno a muchos: Company-Offer (simplificado)
Company.hasMany(Offer, { foreignKey: 'companyId' });
Offer.belongsTo(Company, { foreignKey: 'companyId' });

// Relación muchos a muchos 
User.belongsToMany(Scenter, { through: 'UserScenter' });
Scenter.belongsToMany(User, { through: 'UserScenter' });
Student.belongsToMany(Offer, { through: 'StudentOffer' });
Offer.belongsToMany(Student, { through: 'StudentOffer' });
Company.belongsToMany(Cv, { through: 'CompanyCv' });
Cv.belongsToMany(Company, { through: 'CompanyCv' });

// Relaciones para Applications
Application.belongsTo(Offer, { foreignKey: 'offerId' });
Offer.hasMany(Application, { foreignKey: 'offerId' }); // 🔥 VERIFICAR QUE ESTA LÍNEA EXISTE
Application.belongsTo(Student, { foreignKey: 'studentId' });
Student.hasMany(Application, { foreignKey: 'studentId' });
Application.belongsTo(Company, { foreignKey: 'companyId' });
Company.hasMany(Application, { foreignKey: 'companyId' });

// Relaciones para tokens de empresa
Company.hasOne(Token, {
    foreignKey: 'companyId',
    as: 'tokens'
});

Token.belongsTo(Company, {
    foreignKey: 'companyId',
    as: 'company'
});

Company.hasMany(TokenTransaction, {
    foreignKey: 'companyId',
    as: 'tokenTransactions'
});

TokenTransaction.belongsTo(Company, {
    foreignKey: 'companyId',
    as: 'company'
});

TokenTransaction.belongsTo(Student, {
    foreignKey: 'studentId',
    as: 'student',
    required: false
});

Student.hasMany(TokenTransaction, {
    foreignKey: 'studentId',
    as: 'tokenTransactions'
});

// NUEVO: Relaciones para tokens de estudiantes
Student.hasOne(StudentToken, {
    foreignKey: 'studentId',
    as: 'studentTokens'
});

StudentToken.belongsTo(Student, {
    foreignKey: 'studentId',
    as: 'student'
});

// Relación uno a uno 
User.hasOne(Student, { foreignKey: 'userId' });
Student.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Company, { foreignKey: 'userId' });
Company.belongsTo(User, { foreignKey: 'userId' });
Student.hasOne(Cv, { foreignKey: 'studentId' });
Cv.belongsTo(Student, { foreignKey: 'studentId' });

// Relación uno a muchos adicionales
Profamily.hasMany(Student, { foreignKey: 'profamilyId' });
Student.belongsTo(Profamily, { foreignKey: 'profamilyId', as: 'profamily' });
Profamily.hasMany(Tutor, { foreignKey: 'profamilyId' });
Tutor.belongsTo(Profamily, { foreignKey: 'profamilyId' });


export { 
    User,
    Scenter,
    Tutor, 
    Student, 
    Company, 
    Profamily, 
    Cv, 
    Offer, 
    Application,
    Token,
    TokenTransaction,
    StudentToken // NUEVO
};
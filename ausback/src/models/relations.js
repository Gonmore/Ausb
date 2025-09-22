import { Skill } from './skill.js';
import { StudentSkill } from './studentSkill.js';
// Relación muchos a muchos: Offer-Skill
Offer.belongsToMany(Skill, { through: 'OfferSkill' });
Skill.belongsToMany(Offer, { through: 'OfferSkill' });

// Relación muchos a muchos: Student-Skill
Student.belongsToMany(Skill, { 
    through: StudentSkill,
    foreignKey: 'studentId',
    otherKey: 'skillId',
    as: 'skills'
});
Skill.belongsToMany(Student, { 
    through: StudentSkill,
    foreignKey: 'skillId',
    otherKey: 'studentId',
    as: 'students'
});

// Relaciones directas con StudentSkill
Student.hasMany(StudentSkill, { 
    foreignKey: 'studentId',
    as: 'studentSkills'
});
StudentSkill.belongsTo(Student, { 
    foreignKey: 'studentId',
    as: 'student'
});

Skill.hasMany(StudentSkill, { 
    foreignKey: 'skillId',
    as: 'studentSkills'
});
StudentSkill.belongsTo(Skill, { 
    foreignKey: 'skillId',
    as: 'skill'
});

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
import { StudentToken } from "./studentToken.js";
import UserCompany from './userCompany.js';
import { RevealedCV } from './revealedCV.js';

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
Application.belongsTo(Offer, { 
    foreignKey: 'offerId',
    as: 'offer'
});
Offer.hasMany(Application, { 
    foreignKey: 'offerId',
    as: 'applications'
});

Application.belongsTo(Student, { 
    foreignKey: 'studentId',
    as: 'student'
});

Student.hasMany(Application, { 
    foreignKey: 'studentId',
    as: 'applications'
});

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

// Relaciones para tokens de estudiantes
Student.hasOne(StudentToken, {
    foreignKey: 'studentId',
    as: 'studentTokens'
});

StudentToken.belongsTo(Student, {
    foreignKey: 'studentId',
    as: 'student'
});

// Relación uno a uno 
User.hasOne(Student, { 
    foreignKey: 'userId',
    as: 'student'
});

Student.belongsTo(User, { 
    foreignKey: 'userId',
    as: 'user'
});

Student.hasOne(Cv, { foreignKey: 'studentId' });
Cv.belongsTo(Student, { foreignKey: 'studentId' });

// Relación uno a muchos adicionales
Profamily.hasMany(Student, { foreignKey: 'profamilyId' });
Student.belongsTo(Profamily, { foreignKey: 'profamilyId', as: 'profamily' });
Profamily.hasMany(Tutor, { foreignKey: 'profamilyId' });
Tutor.belongsTo(Profamily, { foreignKey: 'profamilyId' });

// ✅ Relación Many-to-Many con UserCompany
User.belongsToMany(Company, { 
    through: UserCompany, 
    foreignKey: 'userId',
    otherKey: 'companyId',
    as: 'companies'
});

Company.belongsToMany(User, { 
    through: UserCompany, 
    foreignKey: 'companyId',
    otherKey: 'userId',
    as: 'users'
});

// Relaciones directas con la tabla intermedia
User.hasMany(UserCompany, { foreignKey: 'userId' });
UserCompany.belongsTo(User, { 
    foreignKey: 'userId',
    as: 'user'
});

Company.hasMany(UserCompany, { foreignKey: 'companyId' });
UserCompany.belongsTo(Company, { 
    foreignKey: 'companyId',
    as: 'company'
});

// Relaciones para CVs revelados
Company.hasMany(RevealedCV, {
    foreignKey: 'companyId',
    as: 'revealedCVs'
});

RevealedCV.belongsTo(Company, {
    foreignKey: 'companyId',
    as: 'company'
});

Student.hasMany(RevealedCV, {
    foreignKey: 'studentId',
    as: 'revealedCVs'
});

RevealedCV.belongsTo(Student, {
    foreignKey: 'studentId',
    as: 'student'
});

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
    UserCompany,
    StudentToken,
    RevealedCV,
    Skill,
    StudentSkill
};
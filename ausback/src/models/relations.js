import {User}  from "./users.js"
import { Company } from "./company.js"
import { Cv } from "./cv.js"
import { Offer } from "./offer.js"
import { Profamily } from "./profamily.js"
import { Student } from "./student.js"
import { Tutor } from "./tutor.js"
import { Scenter } from "./scenter.js"
import { Application } from "./application.js"
import { CompanyToken, TokenUsage } from "./companyToken.js"

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
Offer.hasMany(Application, { foreignKey: 'offerId' });
Application.belongsTo(Student, { foreignKey: 'studentId' });
Student.hasMany(Application, { foreignKey: 'studentId' });
Application.belongsTo(Company, { foreignKey: 'companyId' });
Company.hasMany(Application, { foreignKey: 'companyId' });

// Relaciones para CompanyToken
CompanyToken.belongsTo(Company, { foreignKey: 'companyId' });
Company.hasOne(CompanyToken, { foreignKey: 'companyId' });

// Relaciones para TokenUsage
TokenUsage.belongsTo(Company, { foreignKey: 'companyId' });
Company.hasMany(TokenUsage, { foreignKey: 'companyId' });
TokenUsage.belongsTo(Student, { foreignKey: 'studentId' });
Student.hasMany(TokenUsage, { foreignKey: 'studentId' });

// Relación uno a uno 
User.hasOne(Student, { foreignKey: 'userId' });
Student.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Company, { foreignKey: 'userId' });
Company.belongsTo(User, { foreignKey: 'userId' });
Student.hasOne(Cv, { foreignKey: 'studentId' });
Cv.belongsTo(Student, { foreignKey: 'studentId' });

// Relación uno a muchos adicionales
Profamily.hasMany(Student, { foreignKey: 'profamilyId' });
Student.belongsTo(Profamily, { foreignKey: 'profamilyId' });
Profamily.hasMany(Tutor, { foreignKey: 'profamilyId' });
Tutor.belongsTo(Profamily, { foreignKey: 'profamilyId' });


export {
    User,
    Scenter,
    Student,
    Company,
    Tutor,
    Profamily,
    Cv,
    Offer,
    Application,
    CompanyToken,
    TokenUsage
};
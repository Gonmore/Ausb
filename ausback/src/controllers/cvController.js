import { Cv } from '../models/cv.js';
import { Student } from '../models/student.js'
import { Company } from '../models/company.js';
import sequelize from '../database/database.js';
import logger from '../logs/logger.js'

async function getCvs(req, res) {
    const { userId } = req.user
    try {
        const student = await Student.findOne({
            where: {
                userId:userId,
            },
        });
        res.json(student);
        try {
            const cv = await Cv.findOne({
                where: {
                    studentId:student.id,
                },
            });
            res.json(cv);
    
        }catch(err){
            logger.error('Error getCv: '+err);
            res.status(500).json({message: 'Server error getting Cv'})
        }

    }catch(err){
        logger.error('Error getStudent: '+err);
        res.status(500).json({message: 'Server error getting Student'})
    }
    
}

async function getCv(req, res) {
    const { userId } = req.user
    const { companyId } = req.params.company;
    const { cvId } = req.params.cv
    try {
        const company = await Company.findByPk(companyId)
        try {
            const cv = await Cv.findByPk(cvId)

            if (company.tokens >1){
                company.tokens =-1
                company.save
                res.json(cv);
            }else{
            res.json({message:'No cuenta con suficientes creditos'})
            }
        }catch(err){
            logger.error('Error getCv: '+err);
            res.status(500).json({message: 'Server error getting Cv'})
        }

    }catch(err){
        logger.error('Error getCompany: '+err);
        res.status(500).json({message: 'Server error getting Company'})
    }
    
}

async function createCv(req, res){
    const { userId } = req.user;
    const { name, email,
        phone, file } = req.body;
    
    
    try {
        const student = await Student.findOne({
            where: {userId}
        })
        await sequelize.transaction(async (t) => {
            Cv.findOne({
                where: {studentId:student.id}
            })
            .then (cv => {
                if(!cv){
                    Cv.create({name, email,
                        phone, file, studentId},
                        { tansaction: t}
                    )
                    logger.info({ userId }, "Cv created");
                    return res.json(cv)
                }
                return res.status(404).json({ mensaje: 'El estudiante ya tiene Cv' })

            })
        })
    }catch(err){
        logger.error('Error createCv: '+err);
        res.status(500).json({message: 'Server error getting Student id'})
    }
}
async function updateCv(req, res) {
    const { userId } = req.user;
    const { name, email,
        phone, file } = req.body;
    try {
        const student = await Student.findOne({
            where: {userId}
        })
        const cv = await Cv.update({name, email,
            phone, file}, {where: {studentId:student.id}});
        if (cv[0] === 0)
            return res.status(404).json({message: 'Cv not found'});
        res.json(cv);

    }catch(err){
        logger.error('Error updateCv: '+err);
        res.status(500).json({message: 'Server error updating cv'})
    }
}

async function deleteCv(req,res){
    const { userId }= req.user;
    const {id} = req.params;

    try{
        const student = await Student.findOne({where: {userId}})
        const cv = await Cv.destroy({ done }, {where: { id, studentId:student.id } });
        //destroy no es recomendado
        if (cv[0] === 0)
            return res.status(404).json({message: 'Cv not found'});
        res.json({message: 'Cv deleted'});

    }catch(err){
        logger.error('Error deleteCv: '+err);
        res.status(500).json({message: 'Server error'})
    }
}
export default {
    getCv,
    getCvs,
    createCv,
    updateCv,
    deleteCv
}


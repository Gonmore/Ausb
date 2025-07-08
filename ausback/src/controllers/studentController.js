import { Student } from '../models/student.js';
import { Status } from '../constants/index.js'
import sequelize from '../database/database.js';
import logger from '../logs/logger.js'

async function getStudent(req, res) {
    const { userId } = req.user;
    console.log(userId)
    try {
        const student = await Student.findOne({
            where: {
                userId:userId,
            },
        });
        res.json(student);

    }catch(err){
        logger.error('Error getStudent: '+err);
        res.status(500).json({message: 'Server error getting Sdudent'})
    }
}

async function createStudent(req, res){
    const { userId } = req.user;
    const { grade,course,car,tag, disp,
        scenter_id, profamily_id } = req.body;
    
        
    try {
        await sequelize.transaction(async (t) => {
            await Student.update(
                { status: Status.INACTIVE },
                {
                    where: { userId: userId, status: Status.ACTIVE }, 
                    transaction: t 
                }
            );
            const student = await Student.create({
                userId:userId,grade,course,car,tag,disp,
                scenter_id, profamily_id
            },
            { tansaction: t}
            );
            logger.info({ userId }, "Student created");
            res.json(student);
        })
    }catch(err){
        logger.error('Error createStudent: '+err);
        res.status(500).json({message: 'Server error creating student'})
    }
}
async function getPreference(req, res) {
    const { userId } = req.user;
    try {
        const preference = await Preference.findOne({
            where: {
                userId:userId,
            },
        });
        res.json(preference);

    }catch(err){
        logger.error('Error getPreference: '+err);
        res.status(500).json({message: 'Server error getting preference'})
    }
}

async function updateStudent(req, res) {
    const { userId } = req.user;
    const { grade,course,car,tag,
        scenter_id, profamily_id  } = req.body;
    try {
        const student = await Student.update({grade,course,car,tag,
            scenter_id, profamily_id }, {where: {userId:userId}});
        if (student[0] === 0)
            return res.status(404).json({message: 'Student not found'});
        res.json(student);

    }catch(err){
        logger.error('Error updateStudent: '+err);
        res.status(500).json({message: 'Server error updating student'})
    }
}

async function activateInactivate(req, res) {
    const { userId }= req.user;
    const {id} = req.params;
    const {active} = req.body;
    try {
        if(!active)   return res.status(400).json({message:'Active is required'});
        
        const student = await Student.findByPk(id);
        if (!student) {
            return res.status(404).json({message: 'student not found'});
        }
        if (student.active === active){
            return res
                .status(400).json({message: 'User already has this status'});
        }
    
        student.active = active;
        await student.save();
        res.json(student);
            
    }catch(error){
        logger.error('Error activateInactivate: '+error);
        res.status(500).json({message: 'Server error'});
    }
}

async function deleteStudent(req,res){
    const { userId }= req.user;
    const {id} = req.params;

    try{
        const student = await Student.destroy({ done }, {where: { id, userId:userId } });
        //destroy no es recomendado
        if (student[0] === 0)
            return res.status(404).json({message: 'Student not found'});
        res.json(student);

    }catch(err){
        logger.error('Error deleteStudent: '+err);
        res.status(500).json({message: 'Server error'})
    }
}
export default {
    getStudent,
    createStudent,
    updateStudent,
    activateInactivate,
    deleteStudent
}


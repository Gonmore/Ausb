import logger from '../logs/logger.js';
import { Status } from '../constants/index.js';
import { User } from '../models/relations.js';

async function getUsers(req, res) {
    try
        {const users = await User.findAll({
            attributes: ['id', 'username', 'status'],
            order: [['id', 'DESC']],
            where: {
                status: Status.ACTIVE,
            }
        }
        )
        res.json(users);}
    catch (error){
        logger.error('Error getUsers: '+ error)
        res.status(500).json ({message: 'server error'});
    }
}

async function createUsers(req, res){
    console.log(req.body)
    try{
        const { username,password} = req.body;
        const user = await User.create({username, password});
        res.json(user);
    } catch (error){
        logger.error('Error createUsers: '+ error);
        res.status(500).json({message: 'server error'});
    }
}

async function getUser(req, res) {
    try {
        const user = await User.findByPk(req.params.id,{
            attributes: ['username','status']
        });
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        res.json(user);

    }catch(error){
        logger.error('Error getUser: ', +error);
        res.status(500).json({message: 'Server error'});

    }
}

async function updateUser(req, res) {
    const {id} = req.params;
    const {username, password} = req.body;
    try {
        if(!username || !password) {
            return res 
            .status(400)
            .json({message:'Username and password are required'});
        }
        const user = await User.update(
            {
                username: username,
                password: password,
            },
            {
                where: {
                    id: id,
                },
            }
        );       
    }catch(error){
        logger.error('Error updateUser: ', +error);
        res.status(500).json({message: 'Server error'});

    }
}

async function activateInactivate(req, res) {
    const {id} = req.params;
    const {status} = req.body;
    try {
        if(!status)   return res.status(400).json({message:'Status is required'});
        
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        if (user.status === status){
            return res
                .status(400).json({message: 'User already activated'});
        }
    
        user.status = status;
        await user.save();
        res.json(user);
            
    }catch(error){
        logger.error('Error activateInactivate: '+error);
        res.status(500).json({message: 'Server error'});
    }
}

async function deleteUser(req,res){
    const {id} = req.params;
    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
    
        await user.destroy();
        res.json({message: 'User deleted successfully'});
            
    }catch(error){
        logger.error('Error deleteUser: '+error);
        res.status(500).json({message: 'Server error'});
    }
}

export default {
    getUsers,
    createUsers,
    getUser,
    updateUser,
    activateInactivate,
    deleteUser,

}
import { Scenter } from '../models/scenter.js';
import { User } from '../models/users.js';
import { Status } from '../constants/index.js'
import sequelize from '../database/database.js';
import logger from '../logs/logger.js'

async function listScenters(req, res) {
    Scenter.findAll({
    })
        .then(scenters => {
        if (!scenters) {
            return res.status(404).json({ mensaje: 'No hay centros de estudio' });
        }
        return res.json(scenters); // Retornar los centros asociados al usuario
        })
        .catch(error => {
        console.error('Error obteniendo centros del usuario:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor' });
        });
}
async function getScenters(req, res) {
    const { userId } = req.user;
    console.log(userId)
    User.findByPk(userId, {
        include: {
            model: Scenter,
            through: { attributes: [] } // Excluir la tabla intermedia en la respuesta
        }
        })
        .then(usuario => {
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        return res.json(usuario.Scenters); // Retornar los centros asociados al usuario
        })
        .catch(error => {
        console.error('Error obteniendo centros del usuario:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor' });
        });
}
async function getScenter(req, res) {
    const { userId } = req.user;
    const { id } = req.params.id;
    console.log(userId)
    try {
        const scenter = await Scenter.findOne({
            where: {
                id:id,
            },
        });
        res.json(scenter);

    }catch(err){
        logger.error('Error getScenter: '+err);
        res.status(500).json({message: 'Server error getting Sdudent'})
    }
}

async function createScenter(req, res){
    const { userId } = req.user;
    const { name,code,city,address,
        phone,email} = req.body;
    
        
    try {
        await sequelize.transaction(async (t) => {
            const usuario = await User.findByPk(userId)
            const scenter = await Scenter.create({
                name,code,city,address,
                phone,email
            },
            { tansaction: t}
            );
            logger.info({ userId }, "Scenter created");
            usuario.addScenter(scenter)
            res.json(scenter);
        })
    }catch(err){
        logger.error('Error createScenter: '+err);
        res.status(500).json({message: 'Server error creating scenter'})
    }
}

async function updateScenter(req, res) {
    const { userId } = req.user;
    const { scenterId } = req.params.id; // ID del centro en la URL
    const { name,code,city,address,
        phone,email} = req.body; // Datos a actualizar

  // Primero, verificar si el usuario está relacionado con el centro
    UserScenter.findOne({ where: { userId, scenterId } })
    .then(relacion => {
        if (!relacion) {
        return res.status(403).json({ mensaje: 'No tienes permiso para actualizar este centro' });
        }

      // Si la relación existe, proceder con la actualización
        return Scenter.update(name,code,city,address,
            phone,email, { where: { id: scenterId } });
    })
    .then(() => res.json({ mensaje: 'Centro actualizado exitosamente' }))
    .catch(error => {
        console.error('Error al actualizar centro:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    });
}

async function activateInactivate(req, res) {
    const { userId }= req.user;
    const {scenterId} = req.params.id;
    const {active} = req.body;
    try {
        if(!active)   return res.status(400).json({message:'Active is required'});
        const scenter = await Scenter.findByPk(scenterId);
        if (!scenter) {
            return res.status(404).json({message: 'scenter not found'});
        }
        UserScenter.findOne({ where: { userId, scenterId } })
            .then(relacion => {
            if (!relacion) {
            return res.status(403).json({ mensaje: 'No tienes permiso para actualizar este centro' });
            }
            if (scenter.active === active){
                return res
                    .status(400).json({message: 'User already has this status'});
            }
            // Si la relación existe, proceder con la actualización
            return Scenter.update(active, { where: { id: scenterId } });
            })
            .then(() => res.json({ mensaje: 'Centro actualizado exitosamente' }))
            
    }catch(error){
        logger.error('Error activateInactivate: '+error);
        res.status(500).json({message: 'Server error'});
    }
}

async function deleteScenter(req,res){
    const { userId }= req.user;
    const {scenterId} = req.params;

    try{
        UserScenter.findOne({ where: { userId, scenterId } })
            .then(relacion => {
            if (!relacion) {
            return res.status(403).json({ mensaje: 'No tienes permiso para actualizar este centro' });
            }
            })
            const scenter = await Scenter.destroy({ done }, {where: { id, UserId:userId } });
            //destroy no es recomendado
            if (scenter[0] === 0)
                return res.status(404).json({message: 'Scenter not found'});
            res.json(scenter, { mensaje: 'Centro eliminado exitosamente' });
    
    }catch(err){
        logger.error('Error deleteScenter: '+err);
        res.status(500).json({message: 'Server error'})
    }
}
export default {
    listScenters,
    getScenters,
    getScenter,
    createScenter,
    updateScenter,
    activateInactivate,
    deleteScenter
}


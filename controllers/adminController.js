const Grupos = require('../models/Grupos');
const Meeti = require('../models/Meeti');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

exports.panelAdministracion = async (req, res) => {


    // consultas
    const consultas = [];
    consultas.push( Grupos.findAll({ where: { usuarioId : req.user.id }}) );
    consultas.push( Meeti.findAll({ where : { usuarioId : req.user.id, 
                                              fecha : { [Op.gte] : moment(new Date()).format("YYYY-MM-DD") }
                                            },
                                    order : [
                                        ['fecha', 'ASC']
                                    ] 


    }) );
    consultas.push( Meeti.findAll({ where : { usuarioId : req.user.id, 
                                            fecha : { [Op.lt] : moment(new Date()).format("YYYY-MM-DD") }
    }}) );
    // array destructuring
    const [grupos, meeti, anteriores] = await Promise.all(consultas);
    
    res.render('administracion', {
        nombrePagina : 'Panel de Administracion', 
        grupos, 
        meeti,
        anteriores,
        moment
    })
}
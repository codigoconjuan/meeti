const Sequelize = require('sequelize');
const db = require('../config/db');
const Usuarios = require('./Usuarios');
const Meeti = require('./Meeti');

const Comentarios = db.define('comentario', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    mensaje : Sequelize.TEXT
}, {
    timestamps : false
});

Comentarios.belongsTo(Usuarios);
Comentarios.belongsTo(Meeti);

module.exports = Comentarios;
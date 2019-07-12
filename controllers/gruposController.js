const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupos');

const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');
const uuid = require('uuid/v4');

const configuracionMulter = {
    limits : { fileSize : 100000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname+'/../public/uploads/grupos/');
        },
        filename : (req, file, next) => {
            const extension = file.mimetype.split('/')[1];
            next(null, `${shortid.generate()}.${extension}`);
        }
    }), 
    fileFilter(req, file, next) {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            //el formato es valido
            next(null, true);
        } else {
            // el formato no es valido
            next(new Error('Formato no válido'), false);
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');

// sube imagen en el servidor
exports.subirImagen = (req, res, next) => {
    upload(req, res, function(error) {
        if(error) {
            if(error instanceof multer.MulterError) {
                if(error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El Archivo es muy grande')
                } else {
                    req.flash('error', error.message);
                }
            } else if(error.hasOwnProperty('message')) {
                req.flash('error', error.message);
            }
            res.redirect('back');
            return;
        } else {
            next();
        }
    })
}

exports.formNuevoGrupo = async (req, res) => {
    const categorias = await Categorias.findAll();

    res.render('nuevo-grupo', {
        nombrePagina : 'Crea un nuevo grupo',
        categorias
    })
}

// Almacena los grupos en la BD
exports.crearGrupo = async (req, res) => {
    // sanitizar
    req.sanitizeBody('nombre');
    req.sanitizeBody('url');

    const grupo = req.body;

    // almacena el usuario autenticado como el creador del grupo
    grupo.usuarioId = req.user.id;

    // leer la imagen
    if(req.file) {
        grupo.imagen = req.file.filename;
    }

    grupo.id = uuid();
    

    try {
        // almacenar en la bD
        await Grupos.create(grupo);
        req.flash('exito', 'Se ha creado el Grupo Correctamente');
        res.redirect('/administracion');
    } catch (error) {
        // extraer el message de los errores
        const erroresSequelize = error.errors.map(err => err.message);
        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-grupo');
    }
}

exports.formEditarGrupo = async (req, res) => {
    const consultas = [];
    consultas.push( Grupos.findByPk(req.params.grupoId) );
    consultas.push( Categorias.findAll() );

    // Promise con await
    const [grupo, categorias] = await Promise.all(consultas);

    res.render('editar-grupo', {
        nombrePagina : `Editar Grupo : ${grupo.nombre}`,
        grupo,
        categorias
    })
}

// guarda los cambios en la BD
exports.editarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where : { id : req.params.grupoId, usuarioId : req.user.id }});

    // si no existe ese grupo o no es el dueño
    if(!grupo) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    // todo bien, leer los valores
    const { nombre, descripcion, categoriaId, url } = req.body;

    // asignar los valores
    grupo.nombre =  nombre;
    grupo.descripcion = descripcion;
    grupo.categoriaId = categoriaId;
    grupo.url = url;

    // guardamos en la base de datos
    await grupo.save();
    req.flash('exito', 'Cambios Almacenados Correctamente');
    res.redirect('/administracion');

}

// Muestra el formulario para editar una imagen de grupo
exports.formEditarImagen = async (req, res) => {
    const grupo = await Grupos.findOne({ where : { id : req.params.grupoId, usuarioId : req.user.id }});

    res.render('imagen-grupo', {
        nombrePagina : `Editar Imagen Grupo : ${grupo.nombre}`,
        grupo
    })
}

// Modifica la imagen en la BD y elimina la anterior
exports.editarImagen = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where : { id : req.params.grupoId, usuarioId : req.user.id }});

    // el grupo existe y es válido
    if(!grupo) {
        req.flash('error', 'Operación no válida');
        res.redirect('/iniciar-sesion');
        return next();
    }

    // verificar que el archivo sea nuevo
    // if(req.file) {
    //     console.log(req.file.filename);
    // }

    // // revisar que exista un archivo anterior
    // if(grupo.imagen) {
    //     console.log(grupo.imagen);
    // }

    // Si hay imagen anterior y nueva, significa que vamos a borrar la anterior
    if(req.file && grupo.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;

        // eliminar archivo con filesystem
        fs.unlink(imagenAnteriorPath, (error) => {
            if(error) {
                console.log(error);
            }
            return;
        })
    }

    // Si hay una imagen nueva, la guardamos
    if(req.file) {
        grupo.imagen = req.file.filename;
    }

    // guardar en la BD
    await grupo.save();
    req.flash('exito', 'Cambios Almacenados Correctamente');
    res.redirect('/administracion');

}

// Muestra el formulario para eliminar un grupo
exports.formEliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where : { id : req.params.grupoId, usuarioId : req.user.id }});

    if(!grupo) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    // todo bien, ejecutar la vista
    res.render('eliminar-grupo', {
        nombrePagina : `Eliminar Grupo : ${grupo.nombre}`
    })
}

/** Elimina el grupo e imagen */
exports.eliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where : { id : req.params.grupoId, usuarioId : req.user.id }});


    // Si hay una imagen, eliminarla
    if(grupo.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;

        // eliminar archivo con filesystem
        fs.unlink(imagenAnteriorPath, (error) => {
            if(error) {
                console.log(error);
            }
            return;
        });
    }

    // Eliminar el grupo
    await Grupos.destroy({
        where: {
            id: req.params.grupoId
        }
    });

    // Redireccionar al usuario
    req.flash('exito', 'Grupo Eliminado');
    res.redirect('/administracion');

}
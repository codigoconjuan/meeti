const nodemailer = require('nodemailer');
const emailConfig = require('../config/emails');
const fs = require('fs');
const util = require('util');
const ejs = require('ejs');

let transport = nodemailer.createTransport({
    host : emailConfig.host,
    port : emailConfig.port, 
    auth: {
        user: emailConfig.user, 
        pass: emailConfig.pass
    }
});

exports.enviarEmail = async (opciones) => {
    console.log(opciones);

    // leer el archivo para el mail
    const archivo = __dirname + `/../views/emails/${opciones.archivo}.ejs`;

    // compilarlo
    const compilado = ejs.compile(fs.readFileSync(archivo, 'utf8'));
    
    // crear el HTML
    const html = compilado({ url : opciones.url });

    // configurar las opciones del email
    const opcionesEmail = {
        from : 'Meeti <noreply@meeti.com>',
        to : opciones.usuario.email,
        subject: opciones.subject,
        html
    }

    // enviar el mail
    const sendEmail = util.promisify(transport.sendMail, transport);
    return sendEmail.call(transport, opcionesEmail);
}
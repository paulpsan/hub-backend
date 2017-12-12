'use strict'

import jwt from 'jwt-simple';
import moment from 'moment';
let secret = "clave_secreta";
exports.createToken = (usuario)=>{
    let payload={
        sub:usuario._id,
        nombre:usuario.nombre,
        email:usuario.email,
        role:usuario.role,
        iat:moment().unix(),                //fecha de creacion
        exp:moment().add(30,'days').unix    //fecha de expiracion
    }
    return jwt.encode(payload,secret);
}

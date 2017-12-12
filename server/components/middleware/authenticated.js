'use strict'

import jwt from 'jwt-simple';
import moment from 'moment';
let secret = 'clave_secreta';

exports.ensureAuth = (req,res,next)=>{
    if(!req.headers.authorization){
        return res
        .status(403)
        .send({message:"la peticion no tiene la cabecera de authentcacion"})
    }
    let token= req.headers.authorization.replace(/['""']+/g,"");
    try{
        let payload = jwt.decode(token,secret);
        if(payload.exp <=moment.unix()){
            console.log(payload.exp);
            return res.status(401).send({message:"token ha expirado"})
        }
    } catch(ex){
        return res.status(404).send({message:"token no valido"});
    }
    req.usuario=payload;
    next();
}
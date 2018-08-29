# MODULO DE RECEPCION DE CORRESPONDENCIA

## Instalación de dependencias

**GIT**

> $ sudo apt-get install git

Para verificar la instalación: $ git --version

**CURL**

> $ sudo apt-get install curl

Para verificar la instalación: $ curl --version

**NODE mediante NVM**

> $ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
>
> $ source ~/.bashrc
>
> Para verificar la instalación: nvm --version
>
> $ nvm install v8.9.4
>
> $ nvm use v8.9.4

Comprobar instalación: node --version

## Clonar el repositorio

Clonar el proyecto desde GitLab

> $ git clone git@gitlab.geo.gob.bo:psanchez/hub-software-backend.git

Ingresar al directorio del proyecto clonado hub-software-backend

> $ cd hub-software-backend

## Configuracion del Proyecto

Ingresar al directorio config

> $ cd server/config/environment/

Copiar el archivo development.js.sample a development.js y production.js.sample a production.js

> $ cp development.sample.js development.js

> $ cp production.sample.js production.js

## Instalación en Desarrollo

Instalar las dependencias del proyecto backend

> $ npm install

Iniciar el proyecto

> $ cd ..

> $ npm start 

## Instalar PM2

> $ npm install pm2
>
> $ pm2 start index.js --env production

## Instalacion de la base de Datos

> $ sudo apt-get install postgresql

> $ sudo apt-get install postgresql-9.6

> $ sudo -u postgres psql


> $ ALTER USER postgres PASSWORD 'suContrasenia'

> $ create database catalogo;
;
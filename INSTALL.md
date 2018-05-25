# MODULO DE RECEPCION DE CORRESPONDENCIA

## Instalación de dependencias

**GIT**

> $ sudo apt-get install git

Para verificar la instalación: $ git --version

**CURL**

> $ sudo apt-get install curl

Para verificar la instalación: $ curl --version

**NODEJS**(>= 6.X.X)

> $ curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
>
> $ sudo apt-get install -y nodejs
>
> Para verificar la instalación: node --version

Para verificar la instalación: npm –version (>= 2.x.x)

**ANGULAR CLI**

> $ npm install -g @angular/cli

Para verificar la instalación: $ ng --version

**RETHINKDB**
En caso de haber instalado rethink en el artefacto git@gitlab.geo.gob.bo:mmayori/veritas.git saltar este paso!

Fuente: https://www.rethinkdb.com/docs/install/debian/

> $ echo "deb http://download.rethinkdb.com/apt `lsb_release -cs` main" | sudo tee /etc/apt/sources.list.d/rethinkdb.list
>
> $ wget -qO- https://download.rethinkdb.com/apt/pubkey.gpg | sudo apt-key add -
> $ sudo apt-get update
>
> $ sudo apt-get install rethinkdb
>
> $ sudo service rethinkdb start
>
> Para verificar la instalación:

> $ rethinkdb --version

**_Nota_**
En caso de problemas con libreria libprotobuf9v5 descargar e instalar

> $ wget http://archive.ubuntu.com/ubuntu/pool/main/p/protobuf/libprotobuf9v5_2.6.1-1.3_amd64.deb
>
> $ sudo dpkg -i libprotobuf9v5_2.6.1-1.3_amd64.deb
>
> $ sudo apt-get install rethinkdb

para verificar instalacion y iniciar servicio

> $ rethinkdb --version

> $ sudo cp /etc/rethinkdb/default.conf.sample /etc/rethinkdb/instances.d/instance1.conf

> $ sudo nano /etc/rethinkdb/instances.d/instance1.conf

habilitar web opciones

> http-port=8080
>
> Reiniciar Servicio
> $ sudo service rethinkdb restart

respuesta:

> rethinkdb 2.3.5~0stretch (GCC 5.2.1)

**RABBITMQ**

En caso de haber instalado rabbitmq en el artefacto git@gitlab.geo.gob.bo:mmayori/veritas.git saltar este paso!

> $ wget -O- https://dl.bintray.com/rabbitmq/Keys/rabbitmq-release-signing-key.asc |sudo apt-key add -
>
> sudo apt-get update

Instalar server rabbitmq

> $ sudo apt-get install rabbitmq-server
>
> Habilitar cliente administrador en localhost:15672
> $ sudo rabbitmq-plugins enable rabbitmq_management
>
> Adicionamos usuario y contraseña

> $ sudo rabbitmqctl add_user {usuario} {contraseña}

> $ sudo rabbitmqctl set_user_tags {usuario} administrator

> $ sudo rabbitmqctl set*permissions -p / veritas ".*" ".\_" ".\*"

> $ sudo service rabbitmq-server start

## Clonar el repositorio

Clonar el proyecto desde GitLab

> $ git clone git@gitlab.geo.gob.bo:mmayori/veritas-client.git

Ingresar al directorio del proyecto clonado veritas-client

> $ cd veritas-client

## Configuracion del Proyecto

Ingresar al directorio config

> $ cd config

Copiar el archivo default.js.sample a default.js y production.js.sample a production.js

> $ cp default.sample.js default.js

> $ cp production.sample.js production.js

Configuracion en desarrollo

> $ nano default.js

Configuracion en produccion

> $ nano production.js

Configuracion de la base de datos rethinkdb

Insertar los datos de la instalacion de rethinkdb

    	"rethinkdb": {
        	"host": "[miHost]", //localhost
        	"port": ["miPuerto"],//28015
        	"db": "[miDb]" //veritas
    	},

Configuracion de RabbitMq

Insertar los datos de la instalacion de rabbitmq

    	"rabbitMQ" : {
        "topics": {
    			"host": "amqp://{usuario}:{contraseña}@localhost:5672/", //usuario , contraseña y puerto rabbitmq
    			"exchanges":"veritas-verify",
    			"firstq":"verify",
    			"secondq":"veritas-mail",
    			"topics_key":["info"],
    			"error_key":["error" ,"warning"],
    			"port": 5672,
    			"login": "[usuario]",   //usuario rabbitmq
    			"password": "[contraseña]", //pasword rabbitmq
    			"connectionTimeout": 0,
    			"reconnect": true,
    			"authMechanism":"AMQPLAIN",
    			"vhost":"/"
    		}
    	}

Configuracion de Correo

Insertar los datos del usuario que enviara los correos de verificación

    	"mail" : {
    		user: "[miusuario]", //miusuario@adsib.gob.bo
    		password: "[micontraseña]",
    		host: "[miHostMail]", //mail.adsib.gob.bo
    		port: ["mipuerto"], //587
    		tls: true
    	},

## Instalación en Desarrollo

Instalar las dependencias del proyecto backend

> $ npm install

Configuracion del frontend

> $ nano client/src/environments/environment.ts

Colocar la direccion del backend configurada en config/default.js "https"

    apiEndpoint: "http://localhost:3011/api/v1/documentos/"

Instalar las dependencias del proyecto frontend

> $ cd client

> $ npm install

Compilar archivos del frontend

> $ ng build

Iniciar aplicacion del frontend

> $ ng serve

Iniciar el proyecto

> $ cd ..

> $ node index.js

## Instalación en Produccion

Instalar las dependencias del proyecto

> $ npm install

Configuracion del frontend

> $ nano client/src/environments/environment.prod.ts

Colocar la direccion del backend configurada en config/production.js "url"

    apiEndpoint: "https://desarrollo.adsib.gob.bo/validador_doc/backend/api/v1/documentos/"

> $ nano client/src/app/services/points.ts

    api:{
        host:'https://desarrollo.adsib.gob.bo/validador_doc/backend/',
    }

Compilar el fronend

> $ cd client

> $ npm install

> $ ng build --bh /validador_doc/ --prod

La compilación creará la carpeta dist, lista para su publicación.

> $ cd ..

> $ mv dist validador_doc/

_Configurar en NGINX_

```json
server {
	listen 80 default_server;
	server_name  desarrollo.adsib.gob.bo;
	root /home/[usuario]/veritas-client;

	server_name _;

	location /validador_doc/ {
            try_files $uri$args $uri$args/ $uri $uri/ /validador_doc/index.html =4$
    }

	location /validador_doc/backebnd {
		#index   index.html;
		rewrite ^/validador_doc/backend(.*)$ $1 break;
        proxy_pass http://localhost:3011;

	}
}
```

## Instalar PM2

> $ npm install pm2
>
> $ pm2 start index.js --env production

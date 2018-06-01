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

## Clonar el repositorio

Clonar el proyecto desde GitLab

> $ git clone git@gitlab.geo.gob.bo:psanchez/hub-software-backend.git

Ingresar al directorio del proyecto clonado hub-software-backend

> $ cd hub-software-backend

## Configuracion del Proyecto

Ingresar al directorio config

> $ cd config/environment

Copiar el archivo development.js.sample a development.js y production.js.sample a production.js

> $ cp development.sample.js development.js

> $ cp production.sample.js production.js

Configuracion en desarrollo

> $ nano development.js

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

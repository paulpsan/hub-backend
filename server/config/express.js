"use strict";

import bodyParser from "body-parser";
import redis from "redis";
import session from "express-session";

import cookieParser from "cookie-parser";
import passport from "passport";
import cors from "cors";
import morgan from "morgan";
import methodOverride from "method-override";
import errorHandler from "errorhandler";
import fileUpload from "express-fileupload";
let redisStore = require("connect-redis")(session)
let client = redis.createClient();
export default app => {
  const env = app.get("env");

  app.use(morgan("dev"));

  app.use(methodOverride());

  app.use(
    session({
      secret: "catalogo-software",
      store: new redisStore({
        host: 'localhost',
        port: 6379,
        client: client,
        ttl: 360
      }),
      resave: false,
      saveUninitialized: true
    })
  );
  var corsOptions = {
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    exposedHeaders: ['token', 'x-token', 'x-forwarded-for', 'set-cookie'],
    optionsSuccessStatus: 204
  };
  app.use(cors(corsOptions));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: false
  }));
  app.use(cookieParser());
  app.use(fileUpload());

  if (env === "development" || env === "test") {
    app.use(errorHandler()); // Error handler - has to be last
  }

  app.use(passport.initialize());

  app.use(passport.session());
  // require("../config/github")(passport);

};
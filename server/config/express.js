"use strict";

import bodyParser from "body-parser";

import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "passport";
import cors from "cors";
import morgan from "morgan";
import methodOverride from "method-override";
import errorHandler from "errorhandler";
import fileUpload from "express-fileupload";

var moment = require("moment-timezone");

export default app => {
  moment()
    .tz("America/Los_Angeles")
    .format();

  const env = app.get("env");


  app.use(morgan("dev"));

  app.use(methodOverride());

  
  app.use(
    session({
      secret: "catalogo-software",
      resave: false,
      saveUninitialized: false //guarda informacion en la base de datos cuando nos conectamos
    })
  );
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(fileUpload());

  if (env === "development" || env === "test") {
    app.use(errorHandler()); // Error handler - has to be last
  }

  app.use(passport.initialize());

  app.use(passport.session());
  // require("../config/github")(passport);
  
};

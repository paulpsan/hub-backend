"use strict";
/*eslint no-process-env:0*/

import path from "path";
import _ from "lodash";

const all = {
  env: process.env.NODE_ENV,
  tz: "Europe/Amsterdam",

  // Root path of server
  root: path.normalize(`${__dirname}/../../..`),

  // Browser-sync port
  browserSyncPort: process.env.BROWSER_SYNC_PORT || 3000,

  // Server port
  port: process.env.PORT || 3000,

  // Server IP
  ip: process.env.IP || "0.0.0.0",

  // Should we populate the DB with sample data?
  seedDB: true,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: "bolivia-hub-backend-secret"
  }
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(all, require(`./${process.env.NODE_ENV}.js`) || {});

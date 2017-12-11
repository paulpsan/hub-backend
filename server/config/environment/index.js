'use strict';
/*eslint no-process-env:0*/

import path from 'path';
import _ from 'lodash';

const all = {
    env: process.env.NODE_ENV,
  
    // Root path of server
    root: path.normalize(`${__dirname}/../../..`),
  
    // Browser-sync port
    browserSyncPort: process.env.BROWSER_SYNC_PORT || 3000,
  
    // Server port
    port: process.env.PORT || 3000,
  
    // Server IP
    ip: process.env.IP || '0.0.0.0',
  
    // Should we populate the DB with sample data?
    seedDB: false,
  
    // Secret for session, you will want to change this and make it an environment variable
    secrets: {
      session: 'bolivia-hub-backend-secret'
    },

    oauthGithub:{
      oauth_client_id: "becb33a39e525721517c",
      oauth_client_secret: "36338cdf7057d2086495a241fa3d053766da55c1",
      oauth_host: "github.com",
      oauth_port: 443,
      oauth_path: "/login/oauth/access_token",
      oauth_method: "POST"
    }
  };
  
  // Export the config object based on the NODE_ENV
  // ==============================================
  module.exports = _.merge(
    all,
    require(`./${process.env.NODE_ENV}.js`) || {});
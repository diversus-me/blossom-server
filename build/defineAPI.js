"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = defineAPI;

var _user = require("./api/user");

var _authentication = require("./api/authentication");

var _flower = require("./api/flower");

var _video = require("./api/video");

function checkAuth(req, res, next) {
  if (req.session.authenticated) {
    next();
  }

  return res.status(403);
}

function checkAdmin(req, res, next) {
  if (req.session.role && req.session.role === 'admin') {
    next();
  }

  return res.status(403);
}

function defineAPI(app, models) {
  (0, _flower.getFlowers)(app, models);
  (0, _video.getVideoLength)(app, models);
  const tranporter = (0, _authentication.generateTransporter)();
  (0, _authentication.checkLogin)(app, models);
  (0, _authentication.loginLink)(app, models, tranporter);
  (0, _authentication.login)(app, models);
  (0, _user.createUser)(app, models, checkAuth, checkAdmin);
  (0, _user.deleteUser)(app, models, checkAuth, checkAdmin);
  (0, _flower.createFlower)(app, models, checkAuth);
  (0, _flower.addNode)(app, models, checkAuth);
  (0, _flower.getNode)(app, models);
}
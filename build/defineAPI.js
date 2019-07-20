"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = defineAPI;

var _user = require("./api/user");

var _authentication = require("./api/authentication");

var _flower = require("./api/flower");

var _video = require("./api/video");

var _s = require("./s3/s3");

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
  (0, _authentication.logout)(app, models);
  (0, _user.getUsers)(app, models, checkAuth, checkAdmin);
  (0, _user.createUser)(app, models, checkAuth, checkAdmin);
  (0, _user.deleteUser)(app, models, checkAuth, checkAdmin);
  (0, _flower.createFlower)(app, models, checkAuth);
  (0, _flower.deleteFlower)(app, models, checkAuth);
  (0, _flower.editFlower)(app, models, checkAuth);
  (0, _flower.addNode)(app, models, checkAuth);
  (0, _flower.getNode)(app, models);
  (0, _flower.editNode)(app, models, checkAuth);
  (0, _flower.deleteNode)(app, models, checkAuth);
  app.get('/api/uploadLink', async (req, res) => {
    try {
      const url = await (0, _s.getPresignedUploadUrl)(`testfile${Math.random() * 1000}00`);
      res.status(200).send({
        url
      });
    } catch (error) {
      console.log(error);
    }
  });
}
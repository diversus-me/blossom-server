"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = defineAPI;

function defineAPI(app, models) {
  app.get('/allFlowers', function (req, res) {
    res.json({
      name: 'Dandelion',
      colour: 'Blue-ish'
    });
  });
}
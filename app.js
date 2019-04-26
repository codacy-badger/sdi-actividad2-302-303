// Módulos
var express = require('express');
var app = express();
var swig = require('swig');
var mongo = require('mongodb');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true }));

// Variables
app.set('port', 8081);
app.set('db','mongodb://admin:admin@mywallapop-shard-00-00-crogy.mongodb.net:27017,' +
    'mywallapop-shard-00-01-crogy.mongodb.net:27017,' +
    'mywallapop-shard-00-02-crogy.mongodb.net:27017/test?ssl=true&replicaSet=myWallapop-shard-0&authSource=admin&retryWrites=true');

//Rutas/controladores por lógica
require("./routes/rusuarios.js")(app,swig); // (app, param1, param2, etc.)
require("./routes/rproductos.js")(app,swig, mongo); // (app, param1, param2, etc.)
// lanzar el servidor
app.listen(app.get('port'), function() {
console.log("Servidor activo");
});
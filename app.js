// Módulos
var express = require('express');
var app = express();
var swig = require('swig');
var mongo = require('mongodb');
var crypto = require('crypto');
var expressSession = require('express-session');
app.use(expressSession({ secret: 'abcdefg', resave: true, saveUninitialized: true }));
var expressSession = require('express-session');
var fileUpload = require('express-fileupload');
app.use(fileUpload());

var bodyParser = require('body-parser');
var gestorBD = require("./modules/gestorBD.js");
var mostrarVista = require("./modules/mostrarVista.js");
var validator = require("./modules/Validators.js");
gestorBD.init(app,mongo);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true }));

// Variables
app.set('port', 8081);
app.set('db','mongodb://admin:admin@mywallapop-shard-00-00-crogy.mongodb.net:27017,' +
    'mywallapop-shard-00-01-crogy.mongodb.net:27017,' +
    'mywallapop-shard-00-02-crogy.mongodb.net:27017/test?ssl=true&replicaSet=myWallapop-shard-0&authSource=admin&retryWrites=true');
app.set('clave','abcdefg'); app.set('crypto',crypto);


// routerUsuarioSession
var routerUsuarioSession = express.Router();
routerUsuarioSession.use(function(req, res, next) {
    console.log("routerUsuarioSession");
    if ( req.session.usuario ) {
        // dejamos correr la petición
        next();
    } else {
        console.log("va a : "+req.session.destino);
        res.redirect("/identificarse");
    }
});

//Aplicar routerUsuarioSession
app.use("/productos/agregar",routerUsuarioSession);
app.use("/publicaciones",routerUsuarioSession);
app.use("/producto/comprar",routerUsuarioSession);
app.use("/compras",routerUsuarioSession);

app.use(express.static('public'));


//routerUsuarioVendedor
var routerUsuarioVendedor = express.Router();
routerUsuarioVendedor.use(function(req, res, next) {
    console.log("routerUsuarioVendedor");
    var path = require('path');
    var id = path.basename(req.originalUrl); // Cuidado porque req.params no funciona
// en el router si los params van en la URL.
    gestorBD.obtenerProductos(
        {_id: mongo.ObjectID(id) }, function (productos) {
            console.log(productos[0]);
            if(productos[0].vendedor == req.session.usuario ){
                next();
            } else {
            }
            res.redirect("/tienda");
        })
});
//Aplicar routerUsuarioVendedor
app.use("/producto/modificar",routerUsuarioVendedor);
app.use("/producto/eliminar",routerUsuarioVendedor);


app.get('/', function (req, res) {
    res.redirect('/tienda');
})



//Rutas/controladores por lógica
require("./routes/rusuarios.js")(app,swig, gestorBD,validator); // (app, param1, param2, etc.)
require("./routes/rproductos.js")(app,swig, gestorBD, mostrarVista, validator); // (app, param1, param2, etc.)
require("./routes/rapi.js")(app, gestorBD);

// lanzar el servidor
app.listen(app.get('port'), function() {
console.log("Servidor activo");
});

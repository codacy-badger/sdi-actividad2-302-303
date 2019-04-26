module.exports = function(app, swig, gestorBD) {

    app.get("/productos", function(req, res) {
        var respuesta = swig.renderFile('views/tienda.html', {
            vendedor : 'Tienda de Productos',
            Productos : Productos
        });
        res.send(respuesta);
    });

    app.get('/producto/:id', function (req, res) {
        var criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.obtenerProductos(criterio,function(productos){
            if ( productos == null ){
                res.send(respuesta);
            } else {
                var respuesta = swig.renderFile('views/bproducto.html',
                    {
                        producto : productos[0]
                    });
                res.send(respuesta);
            }
        });
    })
    app.post("/producto", function(req, res) {
        if ( req.session.usuario == null){
            res.redirect("/tienda");
            return;
        }
        var producto = {
            nombre : req.body.nombre,
            descripcion : req.body.descripcion,
            precio : req.body.precio
            vendedor: req.session.usuario
        }
        // Conectarse
        gestorBD.insertarProducto(producto, function(id){
            if (id == null) {
                res.send("Error al insertar canción");
            } else {
                res.send("Agregada la canción ID: " + id);
            }
        });
    });
    app.get('/productos/agregar', function (req, res) {
        if ( req.session.usuario == null) {
            res.redirect("/tienda");
            return;
        }
        var respuesta = swig.renderFile('views/bagregar.html', { });
        res.send(respuesta);
        });

    app.get("/tienda", function(req, res) { gestorBD.obtenerProductos( function(productos) {
        var criterio = {};
        if( req.query.busqueda != null ){
            criterio = {"nombre" : {$regex : ".*"+req.query.busqueda+".*"} };
        }
        gestorBD.obtenerProductos(criterio, function(productos) {
            if (productos == null) {
                res.send("Error al listar ");
            } else {
                var respuesta = swig.renderFile('views/btienda.html',
                    {
                        productos : productos
                    });
                res.send(respuesta);
            }
        });
    });
    });
    app.get("/publicaciones", function(req, res) {
        var criterio = { autor : req.session.usuario };
        gestorBD.obtenerProductos(criterio, function(productos) {
            if (productos == null) {
                res.send("Error al listar ");
            } else {
                var respuesta = swig.renderFile('views/btienda.html',
                    {
                        productos : productos
                    });
                res.send(respuesta);
            }
        });
    });

    app.get('/producto/modificar/:id', function (req, res) {
        var criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.obtenerProductos(criterio,function(productos){
            if ( productos == null ){
                res.send(respuesta);
            } else {
                var respuesta = swig.renderFile('views/bproductoModificar.html',
                    {
                        producto : productos[0]
                    });
                res.send(respuesta);
            }
        });
    })

};
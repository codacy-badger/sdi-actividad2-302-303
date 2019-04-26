module.exports = function(app, swig, gestorBD) {

    app.get("/productos", function(req, res) {
        var respuesta = swig.renderFile('views/tienda.html', {
            vendedor : 'Tienda de Productos',
            Productos : Productos
        });
        res.send(respuesta);
    });

    app.get('/producto/:id', function(req, res) {
        var respuesta = 'id: ' + req.params.id;
        res.send(respuesta);
    });

    app.post("/producto", function(req, res) {
        var producto = {
            nombre : req.body.nombre,
            descripcion : req.body.descripcion,
            precio : req.body.precio
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
        var respuesta = swig.renderFile('views/bagregar.html', { });
        res.send(respuesta); });

    app.get("/tienda", function(req, res) { gestorBD.obtenerCanciones( function(canciones) {
        if (canciones == null) {
            res.send("Error al listar ");
        } else {
            var respuesta = swig.renderFile('views/btienda.html',
                { canciones : canciones
                });
            res.send(respuesta);
        }
    });
    });

};
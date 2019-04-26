module.exports = function(app, swig, mongo) {

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
        mongo.MongoClient.connect(app.get('db'), function(err, db) {
            if (err) {
                res.send("Error de conexión: " + err);
            } else {
                var collection = db.collection('canciones');
                collection.insert(cancion, function(err, result) {
                    if (err) {
                        res.send("Error al insertar " + err);
                    } else {
                        res.send("Agregada id: "+ result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    });
    app.get('/productos/agregar', function (req, res) {
        var respuesta = swig.renderFile('views/bagregar.html', { });
        res.send(respuesta); })

};
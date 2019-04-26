module.exports = {
    mongo: null,
    app: null,
    init: function (app, mongo) {
        this.mongo = mongo;
        this.app = app;
    },
    obtenerProductos: function(criterio,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('productos'); collection.find(criterio).toArray(function(err, productos) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(productos);
                    }
                    db.close();
                });
            }
        });
    },
    insertarProducto: function (producto, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                if (req.files.portada != null) {
                    var imagen = req.files.portada;
                    imagen.mv('public/portadas/' + id
                        + '.png', function (err) {
                        if (err) {
                            res.send("Error al subir la portada");
                        } else {
                            res.send("Agregada id: " + id);
                        }
                    });
                }
            }
        })
    }
};
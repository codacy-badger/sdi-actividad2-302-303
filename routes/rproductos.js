module.exports = function(app, swig, gestorBD) {

    app.get("/productos", function(req, res) {
        var respuesta = swig.renderFile('views/tienda.html', {
            vendedor : 'Tienda de Productos',
            Productos : Productos
        });
        res.send(respuesta);
    });

    app.post("/producto", function(req, res) {
        if ( req.session.usuario == null){
            res.redirect("/tienda");
            return;
        }
        var producto = {
            nombre : req.body.nombre,
            descripcion : req.body.descripcion,
            precio : req.body.precio,
            vendedor: req.session.usuario
        }
        // Conectarse
        gestorBD.insertarProducto(producto, function(id){
            if (id == null) {
                res.send("Error al insertar producto");
            } else {
                if (req.files.portada != null) {
                    var imagen = req.files.portada;
                    imagen.mv('public/portadas/' +
                        id + '.png', function(err) {
                        if (err) {
                            res.send("Error al subir la portada");
                        } else {
                            res.send("Agregada id: " + id);
                        }
                    });
                }
            }
        });
    });
    app.get('/productos/agregar', function (req, res) {
        if ( req.session.usuario == null || req.session.usuario == 'admin@admin.com') {
            res.redirect("/tienda");
            return;
        }
        var respuesta = swig.renderFile('views/bagregar.html', { });
        res.send(respuesta);
        });

    app.get("/tienda", function(req, res) {
        var criterio = {};
        if( req.query.busqueda != null ){
            criterio = {"nombre" : {$regex : ".*"+req.query.busqueda+".*"}
            };
        }
        var pg = parseInt(req.query.pg); // Es String !!!
        if ( req.query.pg == null){ // Puede no venir el param
            pg = 1;
        }
        gestorBD.obtenerProductosPg(criterio, pg , function(productos, total ) {
            if (productos == null) {
                res.send("Error al listar ");
            } else {
                var ultimaPg = total/4;
                if (total % 4 > 0 ){ // Sobran decimales
                     ultimaPg = ultimaPg+1;
                } var paginas = []; // paginas mostrar
                for(var i = pg-2 ; i <= pg+2 ; i++){
                    if ( i > 0 && i <= ultimaPg){ paginas.push(i);
                    }
                } var respuesta = swig.renderFile('views/btienda.html', {
                    productos : productos, paginas : paginas, actual : pg
                });
                res.send(respuesta);
            }
        });
    });
    app.get("/publicaciones", function(req, res) {
        var criterio = { vendedor : req.session.usuario };
        gestorBD.obtenerProductos(criterio, function(productos) {
            if (productos == null) {
                res.send("Error al listar ");
            } else {
                var respuesta = swig.renderFile('views/bpublicaciones.html',
                    {
                        productos : productos
                    });
                res.send(respuesta);
            }
        });
    });

    //TODO PAGINA 34/38 PRACTICA 2. COMPROBAR QUE LA CANCION ES TUYA. NO SE CONTINUÓ A PARTIR DE ESA PAGINA
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
    });

    app.post('/producto/modificar/:id', function (req, res) {
        var id = req.params.id; var criterio = { "_id" : gestorBD.mongo.ObjectID(id) };
        var producto = {
            nombre : req.body.nombre,
            genero : req.body.genero,
            precio : req.body.precio
        }
        gestorBD.modificarProducto(criterio, producto, function(result) {
            if (result == null) {
                res.send("Error al modificar ");
            } else {
                res.send("Modificado "+result);
            }
        });
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
    }),
        app.get('/producto/eliminar/:id', function (req, res) {
            var criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };
            gestorBD.eliminarProducto(criterio,function(productos){
                if ( productos == null ){
                    res.send(respuesta);
                } else {
                    res.redirect("/publicaciones");
                }
            });
        }),
        app.get('/compras', function (req, res) {
            var criterio = { "usuario" : req.session.usuario };
            gestorBD.obtenerCompras(criterio ,function(compras){ if (compras == null) {
                res.send("Error al listar "); } else {
                var productosCompradasIds = [];
                for(i=0; i < compras.length; i++){
                    productosCompradasIds.push( compras[i].productoId );
                }
                var criterio = { "_id" : { $in: productosCompradasIds } }
                gestorBD.obtenerProductos(criterio ,function(productos){
                    var respuesta = swig.renderFile('views/bcompras.html', {
                        productos: productos
                    });
                    res.send(respuesta);
                });
            }
            });
        })
};

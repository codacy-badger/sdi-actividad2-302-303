module.exports = function(app, swig, gestorBD, mostrarVista, validator) {

    app.get("/productos", function(req, res) {
            var respuesta = swig.renderFile('views/btienda.html', {
                vendedor: 'Tienda de Productos',
                Productos: Productos
            });
            res.send(respuesta);

    });

    app.get('/productos/agregar', function (req, res) {
        if(validator.validaAdmin(req.session.usuario)){
            res.redirect('/admin');
        }
        if ( req.session.usuario == null ) {
            res.redirect("/tienda");
            return;
        }
        var respuesta = swig.renderFile('views/bagregar.html', { });
        res.send(respuesta);
        });

    app.get("/tienda", function(req, res) {
        var criterio = {};
        if( req.query.busqueda != null ){
            criterio = {"nombre" : {$regex : new RegExp(".*" + req.query.busqueda + ".*", "i")}
            };
        }
        var pg = parseInt(req.query.pg); // Es String !!!
        if ( req.query.pg == null){ // Puede no venir el param
            pg = 1;
        }
        gestorBD.obtenerProductosPg(criterio, pg , function(productos, total ) {
            if (productos == null) {
                var respuesta = mostrarVista.show('views/btienda.html', {
                    "productos": productos, paginas : paginas, actual : pg,
                    "vendedor": req.session.usuario,
                    "balance": req.session.balance
                }, req.session, swig)
                res.send(respuesta);
            } else {
                var ultimaPg = total/4;
                if (total % 4 > 0 ){ // Sobran decimales
                     ultimaPg = ultimaPg+1;
                } var paginas = []; // paginas mostrar
                for(var i = pg-2 ; i <= pg+2 ; i++){
                    if ( i > 0 && i <= ultimaPg){ paginas.push(i);
                    }
                }
                var respuesta = mostrarVista.show('views/btienda.html', {
                    "productos": productos, paginas : paginas, actual : pg,
                    "vendedor": req.session.usuario,
                    "balance": req.session.balance
                }, req.session, swig)
                res.send(respuesta);
            }
        });
    });
    app.get("/publicaciones", function(req, res) {
        if(validator.validaAdmin(req.session.usuario)){
            res.redirect('/admin');
        } else {
            var criterio = {vendedor: req.session.usuario};
            gestorBD.obtenerProductos(criterio, function (productos) {
                if (productos == null) {
                    res.send("Error al listar ");
                } else {
                    var respuesta = mostrarVista.show('views/bpublicaciones.html', {
                        "productos": productos,
                        "vendedor": req.session.usuario,
                        "balance": req.session.balance
                    }, req.session, swig)
                    res.send(respuesta);
                }
            });
        }
    });

    app.get('/productos/modificar/:id', function (req, res) {
        if(validator.validaAdmin(req.session.usuario)){
            console.log("Entra como admin y se redirecciona");
            res.redirect('/admin');
        } else {
        var criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.obtenerProductos(criterio,function(productos){
            if ( productos == null ){
                console.log("da un error al modificar el producto");
                res.send("Error al modificar");
            } else {
                var respuesta = mostrarVista.show('views/bproductoModificar.html', {
                    "productos": productos[0],
                    "vendedor": req.session.usuario,
                    "balance": req.session.balance
                }, req.session, swig)
                console.log("respuesta---------------------" + respuesta);

                res.send(respuesta);
            }
        }
        );
        }
    });

    app.post('/producto/modificar/:id', function (req, res) {
        if(validator.validaAdmin(req.session.usuario)){
            res.redirect('/admin');
        } else {
        var id = req.params.id; var criterio = { "_id" : gestorBD.mongo.ObjectID(id) };
        var producto = {
            nombre : req.body.nombre,
            descripcion : req.body.descripcion,
            precio : req.body.precio
        }
        gestorBD.modificarProducto(criterio, producto, function(result) {
            if (result == null) {
                res.send("Error al modificar ");
            } else {
                modificarPortada(req.files, id, function (result) {
                    if( result == null){
                        res.send("Error en la modificación");
                    } else {
                        res.send("Modificado");
                    }
                });
            }
        });
    }}),
    function modificarPortada(files, id, callback){
        if (files.portada != null) {
            var imagen =files.portada;
            imagen.mv('public/portadas/' + id + '.png', function(err) {
                if (err) {
                    callback(null); // ERROR
                }
            });
        } else {
            callback(true); // FIN
        }
    },
        app.get('/producto/eliminar/:id', function (req, res) {
                if(validator.validaAdmin(req.session.usuario)){
                    res.redirect('/admin');
                } else {
            var criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };
            gestorBD.eliminarProducto(criterio,function(productos){
                if ( productos == null ){
                    res.send("Error");
                } else {
                    var respuesta = mostrarVista.show('views/bcompras.html', {
                        "productos": productos,
                        "vendedor": req.session.usuario,
                        "balance": req.session.balance
                    }, req.session, swig)
                    //res.send(respuesta);
                }
            });
        }}),
        app.get('/compras', function (req, res) {
                if(validator.validaAdmin(req.session.usuario)){
                    res.redirect('/admin');
                } else {
            var criterio = { "usuario" : req.session.usuario };
            gestorBD.obtenerCompras(criterio ,function(compras){
                if (compras == null) {
                res.send("Error al listar "); } else {
                var productosCompradasIds = [];
                for(i=0; i < compras.length; i++){
                    productosCompradasIds.push( compras[i].productoId );
                }
                var criterio = { "_id" : { $in: productosCompradasIds } }
                gestorBD.obtenerProductos(criterio ,function(productos){
                    var respuesta = mostrarVista.show('views/bcompras.html', {
                        "productos": productos,
                        "vendedor": req.session.usuario,
                        "balance": req.session.balance
                    }, req.session, swig)
                    res.send(respuesta);
                });
            }
            });
        }}),
        app.get('/producto/comprar/:id', function (req, res) {
            if(validator.validaAdmin(req.session.usuario)){
                res.redirect('/admin');
            } else {
            var productoId = gestorBD.mongo.ObjectID(req.params.id);
            var compra = {
                usuario : req.session.usuario,
                productoId : productoId
            }
            gestorBD.insertarCompra(compra ,function(idCompra){
                if ( idCompra == null ){
                    res.send(respuesta);
                } else {
                    gestorBD.obtenerUsuarios({"email" : req.session.usuario },function (usuarios) {
                        if (usuarios == null) {
                            res.send("Error al listar ");
                        } else {

                            gestorBD.obtenerProductos({"_id" : productoId }, function(productos){
                                if(productos == null){
                                    res.send("error");
                                }else {
                                    if(usuarios[0].balance - productos[0].precio >= 0){
                                    var usuario = {
                                        email : usuarios[0].email,
                                        nombre : usuarios[0].nombre,
                                        apellidos : usuarios[0].apellidos,
                                        balance : usuarios[0].balance - productos[0].precio,
                                        password : usuarios[0].password
                                    }
                                    gestorBD.modificarUsuario({"email" : usuarios[0].email}, usuario, function(result){
                                        if(result == null){
                                            res.send("error");
                                        } else{
                                            req.session.balance = usuario.balance;
                                            respuesta = mostrarVista.show('views/bcompras.html', {
                                                "productos": productos,
                                                "vendedor": req.session.usuario,
                                                "balance": req.session.balance
                                            }, req.session, swig)
                                            res.send(respuesta);
                                        }
                                    });
                            }else{
                                        var respuesta = swig.renderFile('views/bInsuficiente.html', {}
                                        );
                                        res.send(respuesta);
                                    }}
                        });
                }
            });
        }})}});
    app.post("/producto", function(req, res) {
        if(validator.validaAdmin(req.session.usuario)){
            res.redirect('/admin');
        }
        if ( req.session.usuario == null){
            res.redirect("/tienda");
            return;
        }
        if(req.body.precio <= 0){
            res.redirect("/admin" +
                "?mensaje=Precio debe ser mayor que 0"+
                "&tipoMensaje=alert-danger ");
        }
        else {
            var date= new Date();
            var producto = {
                nombre: req.body.nombre,
                descripcion: req.body.descripcion,
                precio: req.body.precio,
                vendedor: req.session.usuario,
                imagen: req.body.imagen,
                fecha: date.getDay() + "/" + date.getMonth()+1 + "/" + date.getFullYear()
            }
            // Conectarse
            gestorBD.insertarProducto(producto, function (id) {
                if (id == null) {
                    res.send("Error al insertar producto");
                } else {
                    res.redirect("/publicaciones");

                    }
                });
            }
        }),

        app.get('/producto/:id', function (req, res) {
            if(validator.validaAdmin(req.session.usuario)){
                res.redirect('/admin');
            } else {
                var criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };
                gestorBD.obtenerProductos(criterio,function(productos){
                    if ( productos == null ){
                        res.send(respuesta);
                    } else {
                        var criterio = { "producto" : gestorBD.mongo.ObjectID(req.params._id) };
                        gestorBD.obtenerCompras(criterio ,function(compras){
                            if (compras == null) {
                                var respuesta = mostrarVista.show('views/bproducto.html', {
                                    "productos": productos[0],
                                    "vendedor": req.session.usuario,
                                    "balance": req.session.balance
                                }, req.session, swig)
                                res.send(respuesta);
                            } else {
                                if(compras.length >0){
                                    console.log("Funka");
                                    var respuesta = mostrarVista.show('views/bproductoComprado.html', {
                                        "productos": productos[0],
                                        "vendedor": req.session.usuario,
                                        "balance": req.session.balance
                                    }, req.session, swig)
                                    res.send(respuesta);
                                } else{
                                    var respuesta = mostrarVista.show('views/bproducto.html', {
                                        "productos": productos[0],
                                        "vendedor": req.session.usuario,
                                        "balance": req.session.balance
                                    }, req.session, swig)
                                    res.send(respuesta);
                                }

                            }})
                    }
                });
            }});
};


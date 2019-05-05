module.exports = function (app, gestorBD) {

    app.post("/api/autentificar/", function(req, res) {
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        var criterio = {
            email : req.body.email,
            password : seguro
        }

        gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                res.status(401); // Unauthorized
                res.json({
                    autenticado : false
                })
            } else {
                var token = app.get('jwt').sign(
                    {usuario: criterio.email, tiempo: Date.now() / 1000},
                    "secreto");
                res.status(200);
                res.json({
                    autenticado: true,
                    token: token
                });
            }
        });
    });

    app.get("/api/producto", function(req, res) {

        var criterio={vendedor :{$ne: res.usuario}}
        gestorBD.obtenerProductos( criterio , function(productos) {
            if (productos == null) {
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send( JSON.stringify(productos) );
            }
        });
    });

    app.get("/api/misproducto", function(req, res) {

        var criterio={vendedor : res.usuario}
        gestorBD.obtenerProductos( criterio , function(productos) {
            if (productos == null) {
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send( JSON.stringify(productos) );
            }
        });
    });

    app.get("/api/idconversacion", function(req, res) {
        var IDoferta=req.headers['id_oferta'] || req.body.id_oferta || req.query.id_oferta;
        var user=req.headers['user'] || req.body.user || req.query.user;
        var oferta = gestorBD.mongo.ObjectID(IDoferta);
        var criterio={usuario : user,oferta:oferta}
        gestorBD.obtenerMensajes( criterio , function(productos) {
            if (productos == null) {
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send( JSON.stringify(productos[0]._id) );
            }
        });
    });


    app.post("/api/mensaje", function(req, res) {
        var IDoferta=req.headers['id_oferta'] || req.body.id_oferta || req.query.id_oferta;
        var oferta = gestorBD.mongo.ObjectID(IDoferta);
        var criterio = {"_id" : oferta }
        gestorBD.obtenerProductos(criterio, function (producto) {
            if (producto == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                if (producto[0].vendedor == res.usuario) {
                    var to=req.body.to
                    var criterioRes={"oferta":oferta,"usuario":res.usuario}
                    gestorBD.obtenerMensajes(criterioRes,function (conversacion) {
                        if(conversacion==null){
                            res.send("No existe la conversacion");
                        }else{
                            var criterio= {"usuario":to,"oferta":oferta}
                            var conversacion =
                                {
                                    texto: req.body.mensaje,
                                    autor: res.usuario,
                                    time: Date.now(),
                                    leido: false
                                }
                            gestorBD.insertarConversacion(criterio, conversacion, function(bien){
                                if(!bien){
                                    res.status(500);
                                    res.send("Error al insertar conversacion");
                                }else{
                                    res.status(200);
                                    res.send("Conversacion insertada con exito");
                                }
                            });
                        }
                    });
                } else {
                    var criteroMEN={"oferta":oferta,"usuario":res.usuario}
                    gestorBD.obtenerMensajes({"oferta":oferta,"usuario":res.usuario},function (conversacion) {
                        if(conversacion==null) {
                            var chat = {
                                oferta: oferta,
                                usuario: res.usuario,
                                conversacion: [
                                    {
                                        texto: req.body.mensaje,
                                        autor: res.usuario,
                                        time: Date.now(),
                                        leido: false
                                    }
                                ]
                            }
                            gestorBD.insertarMensaje(chat, function (id) {
                                if (id == null) {
                                    res.status(500);
                                    res.send("Error al insertar mensaje");
                                } else {
                                    res.status(200);
                                    res.send("Mensaje insertado con exito");
                                }
                            });
                        }else if(conversacion[0]==null){
                            var chat = {
                                oferta: oferta,
                                usuario: res.usuario,
                                conversacion : [
                                    {
                                        texto: req.body.mensaje,
                                        autor: res.usuario,
                                        time: Date.now(),
                                        leido: false
                                    }
                                ]
                            }
                            gestorBD.insertarMensaje(chat, function (id) {
                                if (id == null) {
                                    res.status(500);
                                    res.send("Error al insertar mensaje");
                                }else{
                                    res.status(200);
                                    res.send("Mensaje insertado con exito");
                                }
                            });
                        }else{
                            var criterio= {"usuario":res.usuario,"oferta":oferta}
                            var conversacion =
                                {
                                    texto: req.body.mensaje,
                                    autor: res.usuario,
                                    time: Date.now(),
                                    leido: false
                                }
                            gestorBD.insertarConversacion(criterio, conversacion, function(bien){
                                if(!bien){
                                    res.status(500);
                                    res.send("Error al insertar conversacion");
                                }else{
                                    res.status(200);
                                    res.send("Conversacion insertada con exito");
                                }
                            });
                        }
                    });
                }
            }
        });
    });

    //Se le pasa el id de una oferta, y devuelve los usuarios que tienen una conversacion con esa oferta
    app.get("/api/conversacion", function(req, res) {

        var IDoferta=req.headers['id_oferta'] || req.body.id_oferta || req.query.id_oferta;
        var oferta = gestorBD.mongo.ObjectID(IDoferta);
        var criterio={"_id":oferta}
        gestorBD.obtenerProductos(criterio, function (producto) {
            if (producto == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                if (producto[0].vendedor == res.usuario) {
                    gestorBD.obtenerMensajes( {oferta:oferta} , function(mensajes) {
                        if (mensajes == null) {
                            res.status(500);
                            res.json({
                                error: "se ha producido un error"
                            })
                        } else {
                            res.status(200);
                            var array = [];
                            for (var i = 0; i < mensajes.length; i++) {
                                array.push(mensajes[i].usuario);
                            }
                            res.send(array);
                        }
                    });
                } else {
                    res.status(500);
                    res.send("Error al ver conversacion");
                }
            }
        });
    });

    //Se le pasa el email de un usuario, y devuelve las ofertas con las que tiene una conversacion
    app.get("/api/misconversaciones", function(req, res) {

        var criterio={"usuario":res.usuario}
        gestorBD.obtenerMensajes(criterio, function (producto) {
            if (producto == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else if (producto[0] ==null){
                res.status(200);
                res.send([]);
            } else {
                var array = [];
                var i=0;
                for (i = 0; i < producto.length; i++) {
                    console.log(i)
                    var cirterio={_id:producto[i].oferta}
                    gestorBD.obtenerProductos(cirterio, function (producto2) {
                        if (producto == null) {
                            res.status(500);
                            res.json({
                                error: "se ha producido un error"
                            })
                        } else {
                            array.push(producto2)
                            if(i==producto.length){
                                res.status(200);
                                res.send(array);
                            }
                        }
                    });
                }
            }
        });
    });

    app.get("/api/mensajes", function(req, res) {

        var IDoferta=req.headers['id_oferta'] || req.body.id_oferta || req.query.id_oferta;
        var oferta = gestorBD.mongo.ObjectID(IDoferta);
        var criterio={"_id":oferta}
        gestorBD.obtenerProductos(criterio, function (producto) {
            if (producto == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                if (producto[0].vendedor == res.usuario) {
                    criterioMensajes={oferta:oferta}
                } else {
                    criterioMensajes = {oferta: oferta, usuario: res.usuario}
                }
                gestorBD.obtenerMensajes( criterioMensajes , function(mensajes) {
                    if (mensajes == null) {
                        res.status(500);
                        res.json({
                            error : "se ha producido un error"
                        })
                    }else if (mensajes[0] == null) {
                        res.status(200);
                        res.send( JSON.stringify([]) )
                    } else {
                        res.status(200);
                        var array = []
                        for (var i = 0; i < mensajes[0].conversacion.length; i++) {
                            array.push(mensajes[0].conversacion[i]);
                        }
                        res.send( JSON.stringify(array) );
                    }
                });
            }
        });
    });

    app.get('/api/eliminar/', function (req, res) {
        var IDconver=req.headers['id_conversacion'] || req.body.id_conversacion || req.query.id_conversacion;
        var conversacion = gestorBD.mongo.ObjectID(IDconver);
        var criterio = {"_id" : conversacion }
        gestorBD.obtenerMensajes(criterio, function (con) {
            if (con == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                if(con[0].usuario==res.usuario){
                    gestorBD.eliminarConversacion({"_id":conversacion},function (bien) {
                        if(bien==null) {
                            res.status(500);
                            res.send("No se ha podido borrar");
                        }else{
                            res.status(200);
                            res.send("Conversacion eliminada");
                        }
                    });
                } else {
                    var oferta = con[0].oferta;
                    var criterio = {"_id": oferta}
                    gestorBD.obtenerProductos(criterio, function (producto) {
                        if (producto == null) {
                            res.status(500);
                            res.json({
                                error: "se ha producido un error"
                            })
                        } else {
                            if (producto[0].vendedor == res.usuario) {
                                gestorBD.eliminarConversacion({"_id":conversacion},function (bien) {
                                    if(bien==null) {
                                        res.status(500);
                                        res.send("No se ha podido borrar");
                                    }else{
                                        res.status(200);
                                        res.send("Conversacion eliminada");
                                    }
                                });
                            } else{
                                res.status(500);
                                res.send("No se puede eliminar conversaciones ajenas");
                            }
                        }
                    });
                }
            }
        });
    });

    app.get('/api/leido/', function (req, res) {
        var IDconver=req.headers['id_conversacion'] || req.body.id_conversacion || req.query.id_conversacion;
        var conversacion = gestorBD.mongo.ObjectID(IDconver);
        var criterio = {"_id" : conversacion }
        gestorBD.obtenerMensajes(criterio, function (con) {
            if (con == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                if(con[0].usuario==res.usuario){
                    var criterioLeido={"_id":conversacion, "conversacion.autor": {$ne:res.usuario}}
                    var operacionLeer={$set:{"conversacion.$.leido":true}}
                    gestorBD.marcarLeido(criterioLeido,operacionLeer,function (bien) {
                        if(bien==null) {
                            res.status(500);
                            res.send("No se ha podido marcar como leido");
                        }else{
                            res.status(200);
                            res.send("Conversacion marcada como leida");
                        }
                    });
                } else {
                    var oferta = con[0].oferta;
                    var criterio = {"_id": oferta}
                    gestorBD.obtenerProductos(criterio, function (producto) {
                        if (producto == null) {
                            res.status(500);
                            res.json({
                                error: "se ha producido un error"
                            })
                        } else {
                            if (producto[0].vendedor == res.usuario) {
                                //TODO Se tiene que editar un campo dentro de un objeto dentro de un array dentro de un objeto
                                var criterioLeido={"_id":conversacion, 'conversacion.autor': {$ne:res.usuario}}
                                var operacionLeer={$set:{'conversacion.$.leido':true}}
                                gestorBD.marcarLeido(criterioLeido,operacionLeer,function (bien) {
                                    if(bien==null) {
                                        res.status(500);
                                        res.send("No se ha podido marcar como leido");
                                    }else{
                                        res.status(200);
                                        res.send("Conversacion marcada como leida");
                                    }
                                });
                            } else{
                                res.status(500);
                                res.send("No se puede marcar como leido conversaciones ajenas");
                            }
                        }
                    });
                }
            }
        });
    });


}

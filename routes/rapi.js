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
                                    res.send("Error al insertar conversacion");
                                }else{
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
                                    res.send("Error al insertar mensaje");
                                } else {
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
                                    res.send("Error al insertar mensaje");
                                }else{
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
                                    res.send("Error al insertar conversacion");
                                }else{
                                    res.send("Conversacion insertada con exito");
                                }
                            });
                        }
                    });
                }
            }
        });
    });

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
                            var array = []
                            for (var i = 0; i < mensajes.length; i++) {
                                array.push(mensajes[i].usuario);
                            }
                            res.send(array);
                        }
                    });
                } else {
                    res.send("Error al ver conversacion");
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
                console.log(criterioMensajes)
                gestorBD.obtenerMensajes( criterioMensajes , function(mensajes) {
                    if (mensajes == null) {
                        res.status(500);
                        res.json({
                            error : "se ha producido un error"
                        })
                    } else {
                        console.log(mensajes)
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



}

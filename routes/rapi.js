module.exports = function (app, gestorBD) {

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
            } else
            {
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

    //Este metodo es para el usuario, y luego debo hacer otro para el dueño
    //Porque la cosa es que este va a iniciar y enviar mensajes
    //Pero el otro solo va a enviar mensajes, y antes debe de ver los chats para la oferta
    //De donde sacara a quien quiere enviar el mensaje
    app.post("/api/mensaje", function(req, res) {
        var oferta = gestorBD.mongo.ObjectID(req.header['id_oferta']);
        var criterio = {"_id" : oferta }
        gestorBD.obtenerMensajes([{"oferta":oferta},{"usuario":res.usuario}],function (conversacion) {
                if(conversacion==null){
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
                    gestorBD.insertarMensaje(conversacion, function (id) {
                        if (id == null) {
                            res.send("Error al insertar mensaje");
                        }else{
                            res.send("Mensaje insertado con exito");
                        }
                    });
                }else{
                    var criterio= {usuario:res.usuario,oferta:oferta}
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
    });

    app.get("/api/mensajes", function(req, res) {

        var IDoferta = gestorBD.mongo.ObjectID(req.headers['id']);
        var criterio = {_id: IDoferta}
        var criterioMensajes
        gestorBD.obtenerProductos(criterio, function (producto) {
            if (producto == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                if (producto[0].vendedor == res.usuario) {
                    criterioMensajes={oferta:IDoferta}
                } else {
                    criterioMensajes={oferta:IDoferta, from:res.usuario}
                }
                gestorBD.obtenerMensajes( criterioMensajes , function(mensajes) {
                    if (mensajes == null) {
                        res.status(500);
                        res.json({
                            error : "se ha producido un error"
                        })
                    } else {
                        res.status(200);
                        res.send( JSON.stringify(mensajes) );
                    }
                });
            }
        });
    });



}

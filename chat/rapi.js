module.exports(function (app, gestorBD) {

    app.get("/api/producto", function(req, res) {
        gestorBD.obtenerProductos( {} , function(productos) {
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
        var mensaje = {
            from : req.body.from,
            mensaje : req.body.mensaje,
            oferta : req.body.oferta,
        }
        gestorBD.insertarMensaje(mensaje, function(id){
            if (id == null) {
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                res.status(201);
                res.json({
                    mensaje : "mensaje insertardo",
                    _id : id
                })
            }
        });
    });

    app.post("/api/autenticar/", function(req, res) {
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
                res.status(200);
                res.json({
                    autenticado : true
                })
            }

        });
    });
})


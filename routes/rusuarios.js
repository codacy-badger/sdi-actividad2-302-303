module.exports = function(app, swig, gestorBD, validator) {

    app.get("/usuarios", function (req, res) {
        res.send("ver usuarios");
    });

    app.get("/registrarse", function (req, res) {
        var respuesta = swig.renderFile('views/bregistro.html', {});
        res.send(respuesta);
    });

    app.post('/usuario', function (req, res) {
        var criterio = {"email" : req.body.email};
        gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios.length == 0) {
                if (validator.validaContraseña(req.body.password, req.body.password2)) {
                    res.redirect("/registrarse?mensaje=Error al registrar usuario, las contraseñas no coinciden");
                } else {
                    var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
                        .update(req.body.password).digest('hex');

                    var usuario = {
                        email: req.body.email,
                        nombre: req.body.nombre,
                        apellidos: req.body.apellidos,
                        balance: 100,
                        password: seguro
                    }
                    gestorBD.insertarUsuario(usuario, function (id) {
                        if (id == null) {
                            res.redirect("/registrarse?mensaje=Error al registrar usuario")
                        } else {
                            res.redirect("/tienda");
                        }
                    });
                }
            } else {
                res.redirect("/registrarse?mensaje=El email ya existe")
            }
        });

    });
    app.get("/identificarse", function (req, res) {

            var respuesta = swig.renderFile('views/bidentificacion.html', {});
            res.send(respuesta);
    });
    app.post("/identificarse", function (req, res) {
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        var criterio = {
            email: req.body.email,
            password: seguro
        }
        gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                req.session.usuario = null;
                res.redirect("/identificarse" +
                    "?mensaje=Email o password incorrecto" +
                    "&tipoMensaje=alert-danger ");
            } else {
                req.session.usuario = usuarios[0].email;
                req.session.balance = usuarios[0].balance;
                if(usuarios[0].email == 'admin@admin.com'){
                    res.redirect('/admin');
                } else {
                    res.redirect("/publicaciones");
                }
            }
        });
    });
    app.get('/desconectarse', function (req, res) {
        req.session.usuario = null;
        res.redirect("/identificarse");
    });
    app.get("/admin", function (req, res) {
        if(req.session.usuario=="admin@admin.com") {
            gestorBD.obtenerUsuarios({}, function (usuarios) {
                if (usuarios == null) {
                    res.send("Error al listar ");
                } else {
                    var respuesta = swig.renderFile('views/admin.html',
                        {
                            usuarios: usuarios
                        }
                    );
                    res.send(respuesta);
                }
            });
        } else{
            var respuesta = swig.renderFile('views/error.html',
                {

                }
            );
            res.send(respuesta);
        }
    });
    app.post("/admin/delete", function (req, res) {
        console.log(req.body.ch); // to get array of checked checkbox
        var usuariosarray = req.body.ch;
        if (usuariosarray instanceof Array) {
            for (var i = 0; i < usuariosarray.length; i++) {
                var usuariolimpio = usuariosarray[i].substring(0, usuariosarray[i].length - 1);
                console.log(usuariolimpio);
                var criterio = {"email": usuariolimpio};
                gestorBD.eliminarUsuario(criterio, function (usuarios) {
                    if (usuarios == null) {
                        res.send(respuesta);
                    }
                });
            } res.redirect("/admin" +
                "?mensaje=Usuarios borrados" +
                "&tipoMensaje=alert-danger ");

        } else {
            var usuariolimpio = usuariosarray.substring(0, usuariosarray.length - 1);
            console.log(usuariolimpio);
            var criterio = {"email": usuariolimpio};
            gestorBD.eliminarUsuario(criterio, function (usuarios) {
                if (usuarios == null) {
                    res.send(respuesta);
                }
                else{
                    res.redirect("/admin" +
                        "?mensaje=Usuarios borrados" +
                        "&tipoMensaje=alert-danger ");
                }
            });

        }
    });

    app.get("/test", function (req, res) {
       gestorBD.test(function(){});
    })
}

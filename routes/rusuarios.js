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
                    } else{
                        res.redirect("/admin" +
                            "?mensaje=Usuarios borrados" +
                            "&tipoMensaje=alert-danger ");
                    }
                });
            }

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
        gestorBD.test( {
        });
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update("1").digest('hex');
        var usuario = {
            email: "1@gmail.com",
            nombre: "1",
            apellidos: "1",
            balance: 100,
            password: seguro
        }
        gestorBD.insertarUsuario(usuario, function (id) {
        });
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update("12").digest('hex');
        var usuario = {
            email: "12@gmail.com",
            nombre: "12",
            apellidos: "12",
            balance: 100,
            password: seguro
        }
        gestorBD.insertarUsuario(usuario, function (id) {
        });
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update("123").digest('hex');
        var usuario = {
            email: "123@gmail.com",
            nombre: "123",
            apellidos: "123",
            balance: 100,
            password: seguro
        }
        gestorBD.insertarUsuario(usuario, function (id) {
        });
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update("1234").digest('hex');
        var usuario = {
            email: "1234@gmail.com",
            nombre: "1234",
            apellidos: "1234",
            balance: 100,
            password: seguro
        }
        gestorBD.insertarUsuario(usuario, function (id) {
        });
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update("12345").digest('hex');
        var usuario = {
            email: "12345@gmail.com",
            nombre: "12345",
            apellidos: "12345",
            balance: 100,
            password: seguro
        }
        gestorBD.insertarUsuario(usuario, function (id) {
        });
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update("123456").digest('hex');
        var usuario = {
            email: "123456@gmail.com",
            nombre: "123456",
            apellidos: "123456",
            balance: 100,
            password: seguro
        }
        gestorBD.insertarUsuario(usuario, function (id) {
        });
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update("1234567").digest('hex');
        var usuario = {
            email: "1234567@gmail.com",
            nombre: "1234567",
            apellidos: "1234567",
            balance: 100,
            password: seguro
        }
        gestorBD.insertarUsuario(usuario, function (id) {
        });
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update("12345678").digest('hex');
        var usuario = {
            email: "12345678@gmail.com",
            nombre: "12345678",
            apellidos: "12345678",
            balance: 100,
            password: seguro
        }
        gestorBD.insertarUsuario(usuario, function (id) {
        });
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update("123456789").digest('hex');
        var usuario = {
            email: "123456789@gmail.com",
            nombre: "123456789",
            apellidos: "123456789",
            balance: 100,
            password: seguro
        }
        gestorBD.insertarUsuario(usuario, function (id) {
        });
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update("prueba").digest('hex');
        var usuario = {
            email: "prueba@prueba.com",
            nombre: "123456",
            apellidos: "123456",
            balance: 100,
            password: seguro
        }
        gestorBD.insertarUsuario(usuario, function (id) {
        });
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update("admin").digest('hex');
        var usuario = {
            email: "admin@admin.com",
            nombre: "Administrador",
            apellidos: "123456",
            balance: 100,
            password: seguro
        }
        gestorBD.insertarUsuario(usuario, function (id) {
        });

    });
};

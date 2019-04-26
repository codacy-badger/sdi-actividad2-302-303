module.exports = function(app, swig) {

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
        res.send("Canción agregada:"
            +req.body.nombre
            +"<br>"
            +" genero :"
            +req.body.genero
            +"<br>"
            +" precio: "+
            req.body.precio);
    });
    app.get('/productos/agregar', function (req, res) {
        var respuesta = swig.renderFile('views/bagregar.html', { });
        res.send(respuesta); })

};
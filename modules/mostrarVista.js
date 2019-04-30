module.exports = {
    show : function(files, variables , session, swig) {
            variables["usuario"] = session.usuario;
            variables["balance"] = session.balance;
            variables["ofertas"] = session.productos;
            return swig.renderFile(files, variables);

    }
};
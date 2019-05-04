module.exports = {
    mongo: null,
    app: null,
    init: function (app, mongo) {
        this.mongo = mongo;
        this.app = app;
    },
    obtenerProductosPg : function(criterio,pg,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) { funcionCallback(null);
            } else {
                var collection = db.collection('productos');
                collection.count(function(err, count){
                    collection.find(criterio).skip( (pg-1)*4 ).limit( 4 )
                        .toArray(function(err, productos) {
                            if (err) {
                                funcionCallback(null);
                            } else {
                                funcionCallback(productos, count);
                            } db.close();
                        });
                });
            }
        });
        },
    obtenerCompras : function(criterio,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) { if (err) {
            funcionCallback(null);
        } else {
            var collection = db.collection('compras');
            collection.find(criterio).toArray(function(err, usuarios) {
                if (err) {
                    funcionCallback(null);
                } else {
                    funcionCallback(usuarios);
                }
                db.close();
            });
        }
        });

    },
    insertarCompra: function(compra, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('compras');
                collection.insert(compra, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    } db.close();
                });
            }
        });

    },
    eliminarProducto : function(criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) { funcionCallback(null);
            } else {
                var collection = db.collection('productos');
                collection.remove(criterio, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    } db.close();
                });
            }
        });
        },
    eliminarUsuario : function(criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) { funcionCallback(null);
            } else {
                var collection = db.collection('usuarios');
                collection.remove(criterio, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    } db.close();
                });
            }
        });
    },
    modificarProducto : function(criterio, producto, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('productos');
                collection.update(criterio, {$set: producto}, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        })
    },
    modificarUsuario : function(criterio, usuario, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('usuarios');
                collection.update(criterio, {$set: usuario}, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        })
    },
    obtenerUsuarios : function(criterio,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {

            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('usuarios');
                collection.find(criterio).toArray(function(err, usuarios) {
                    if (err) { funcionCallback(null);
                    } else {
                        funcionCallback(usuarios);
                    } db.close();
                });
            }
        });
    },
    insertarUsuario : function(usuario, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('usuarios');
                collection.insert(usuario, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    } db.close();
                });
            }
        });
    },
    obtenerProductos:  function(criterio,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('productos');
                collection.find(criterio).toArray(function(err, productos) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(productos);
                    }
                    db.close();
                });
            }
        });
    },
    insertarProducto: function (producto, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('productos');
                collection.insert(producto, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    },insertarMensaje: function (mensaje, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('mensajes');
                collection.insert(mensaje, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    },
    insertarConversacion: function (criterio,conversacion, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('mensajes');
                collection.update(criterio,{$push:{conversacion:conversacion}}, function(err, result) {
                    if (err) {
                        funcionCallback(false);
                    } else {
                        funcionCallback(true);
                    }
                    db.close();
                });
            }
        });
    },
    obtenerMensajes:  function(criterio,funcionCallback){
    this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
        if (err) {
            funcionCallback(null);
        } else {
            var collection = db.collection('mensajes');
            collection.find(criterio).toArray(function(err, mensajes) {
                if (err) {
                    funcionCallback(null);
                } else {
                    funcionCallback(mensajes);
                }
                db.close();
            });
        }
    });
    },
    eliminarConversacion : function(criterio, funcionCallback) {
    this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
        if (err) { funcionCallback(null);
        } else {
            var collection = db.collection('mensajes');
            collection.remove(criterio, function(err, result) {
                if (err) {
                    funcionCallback(null);
                } else {
                    funcionCallback(result);
                } db.close();
            });
        }
    });
    },
    marcarLeido: function (criterio,operacion, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('mensajes');
                collection.update(criterio,operacion, function(err, result) {
                    if (err) {
                        funcionCallback(false);
                    } else {
                        funcionCallback(true);
                    }
                    db.close();
                });
            }
        });
    },
    test: function () {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                db.collection("usuarios").drop(function(err, delOK) {
                    if (err) throw err;
                    if (delOK) console.log("Collection deleted");
                    db.close();
                });
            }
        });
    }
};

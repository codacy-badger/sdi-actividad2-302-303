var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

var ObjectId = mongoose.Schema.Types.ObjectId;
var Message = mongoose.model('Mensaje',{
    mensaje : String,
    ID_usuario : ObjectId,
    ID_oferta : ObjectId
})

var dbUrl = 'mongodb+srv://admin:admin@mywallapop-crogy.mongodb.net/test?retryWrites=true'


io.on('connection', () =>{
    console.log('a user is connected')
})

mongoose.connect(dbUrl ,{useMongoClient : true} ,(err) => {
    console.log('mongodb connected',err);
})

var server = http.listen(3000, () => {
    console.log('server is running on port', server.address().port);
});

require("./chat/rmensajes.js")(app,mongoose,io,Message); // (app, param1, param2, etc.)






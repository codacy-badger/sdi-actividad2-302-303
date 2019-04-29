module.exports(function (app, mongoose, io, Message) {

    app.get('/messages', (req, res) => {
        Message.find({},(err, messages)=> {
            res.send(messages);
        })
    })

    app.get('/messages/:user', (req, res) => {
        var user = req.params.user
        Message.find({name: user},(err, messages)=> {
            res.send(messages);
        })
    })

    app.post('/messages', async (req, res) => {
        try{
            var message = new Message(req.body);
            var savedMessage = await message.save()
            console.log('saved');
            io.emit('message', req.body);
            res.sendStatus(200);
        }
        catch (error){
            res.sendStatus(500);
            return console.log('error',error);
        }
        finally{
            console.log('Message Posted')
        }
    })

})


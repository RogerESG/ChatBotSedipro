var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

const APP_TOKEN = 'EAAfZAZB0o7lS8BAAROvzZB11RfdieKZBuJ76pixYWZAedNOEqkp5RZBL5fuESZBDgSIalSiC80TjbCazcHfhLX120P6T0SZB4jtJU78ZBUKeoTzdMbZBYzi3zgwZAgYlZC3b38JrpYv9yJ0LXC7VDRBVXiUpHp8sJ6WoVxNBwUxkLQZBT1kdwOWUfeWqU';

var app = express();
app.use(bodyParser.json());

app.listen(3000, function(){
    console.log("El servidor se encuentra en el puerto 3000");
});

app.get('/', function(req, res){
    res.send('Bienvenido');
});

app.get('/webhook', function(req, res){
    
    if(req.query['hub.verify_token'] === 'sedipro2018'){
        res.send(req.query['hub.challenge']);
    }else{
        res.send('Tu no tienes que entrar aqui');
    }  
});

app.post('/webhook', function(req, res){

    var data = req.body;
    if(data.object == 'page'){
        data.entry.forEach(function(pageEntry){
            pageEntry.messaging.forEach(function(messagingEvent){
                if(messagingEvent.message){
                    receiveMessage(messagingEvent);
                }                
            });          
        });
        res.sendStatus(200);
    }
});



function receiveMessage(event){
    var senderID = event.sender.id;
    var messageText = event.message.text;
    evaluateMessage(senderID, messageText);
}

function evaluateMessage(recipientId, message){
    var finalMessage = '';

    if(isContain(message, 'ayuda')){
        finalMessage = 'por el momento no te puedo ayudar';
    }else if(isContain(message, 'gato')){
        sendMessageImage(recipientId);
    }else if(isContain(message, 'clima')){
        getWeather(function(temperatura){
            message = getMessageWeather(temperatura);
            sendMessageText(recipientId,message);
        });
    }else{
        finalMessage = 'solo se repetir las cosas: ' + message;
    }
    sendMessageText(recipientId, finalMessage);
}

function sendMessageText(recipientId, message){
    var messageData = {
        recipient : {
            id : recipientId
        },
        message: {
            text: message
        }
    };
    callSendAPI(messageData);
}

function sendMessageImage(recipientId){
    var messageData = {
        recipient : {
            id : recipientId
        },
        message: {
            attachment:{
                type: "image",
                payload: {
                    url: "https://i.imgur.com/SOFXhd6.jpg"
                }
            }
        }
    };
    callSendAPI(messageData);
}

function callSendAPI(messageData){

    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs : { access_token : APP_TOKEN },
        method: 'POST',
        json: messageData
    }, function(error, response, data){

        if(error){
            console.log('No es posible enviar el mensaje');
        }else{
            console.log("El mensaje fue enviado");
        }
    });
}

function getMessageWeather(temperatura){
    if (temperatura > 30){       
        return "nos encontramos a "+ temperatura + ". Hay demasiado calor, te recomiendo que no salgas";
    }else{
        return "nos encontramos a "+ temperatura + ". Es un bonito día para salir";
    }             
}


function getWeather(callback){
    request('http://api.geonames.org/findNearByWeatherJSON?lat=16.750000&lng=-93.116668&username=eduardo_gpg',
    function(error, response, data){
        if(!error){        
            var response = JSON.parse(data);        
            var temperatura = response.weatherObservation.temperature;
            callback(temperatura)
        }
    });
}

function isContain(sentence, word){
    return sentence.indexOf(word) > -1;
}
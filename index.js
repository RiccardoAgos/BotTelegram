// Dependencies
const express = require('express');
const app = express();
const axios = require('axios');
const bodyParser = require('body-parser');
const port = 80;
const url = 'https://api.telegram.org/bot';
const apiToken = '5047978121:AAFXPC7tvG7C82bmuakoaxo6z9HRsGYDtME';

//TOKEN ='5047978121:AAFXPC7tvG7C82bmuakoaxo6z9HRsGYDtME';
//SERVER_URL='https://b2e4-80-104-141-187.ngrok.io';
// Configurations
app.use(bodyParser.json());
// Endpoints
app.post('/', (req, res) => {
     //console.log(req.body);
     const chatId = req.body.message.chat.id;
     const sentMessage = req.body.message.text;
     
     // Regex for hello
     if (sentMessage.match(/hello/gi)) {
          axios.post(`${url}${apiToken}/sendMessage`,
               {
                    chat_id: chatId,
                    text: 'Hello 👋'
               })
               .then((response) => { 
                    res.status(200).send(response);
               }).catch((error) => {
                    res.send(error);
               });
     } else {
          // if no hello present, just respond with "ciao"
          axios.post(`${url}${apiToken}/sendMessage`,
               {
                    chat_id: chatId,
                    text: 'Ciao 👋'
               })
               .then((response) => { 
                    res.status(200).send(response);
               }).catch((error) => {
                    res.send(error);
               });
     }
});
// Listening
app.listen(port, () => {
     console.log(`Listening on port ${port}`);
});

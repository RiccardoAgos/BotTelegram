// Dependencies
const express = require('express');
const app = express();
const axios = require('axios');
const bodyParser = require('body-parser');
const port = 80;
const url = 'https://api.telegram.org/bot';
const apiToken = '5047978121:AAFXPC7tvG7C82bmuakoaxo6z9HRsGYDtME';
const fs = require('fs');

// Importing the game file
const customer = require('./The_Chasm_of_Doom.json');

//for bot.on
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(apiToken);

//create string
var string = "";
var super_string = "";

//SERVER_URL='https://761c-80-104-141-187.ngrok.io';
// Configurations
app.use(bodyParser.json());

var number_player = 1,
     chapter = 0,
     life = 100,
     account_esistente = false;

//metodo per scrivere sul file
function jsonReader(filePath, cb) {
  fs.readFile(filePath, (err, fileData) => {
    if (err) {
      return cb && cb(err);
    }
    try {
      const object = JSON.parse(fileData);
      return cb && cb(null, object);
    } catch (err) {
      return cb && cb(err);
    }
  });
}



app.post('/', (req, res) => {
     console.log(req.body);
     const chatId = req.body.message.chat.id;
     let sentMessage = req.body.message.text;
     
     account_esistente = false;
     // start game
     if (sentMessage == "start") {
          jsonReader("./giocatori.json", (err, giocatore) => {
               if (err) {
                    console.log(err);
                    return;
               }

               number_player = giocatore.player.length;

               for(var i = 0;i < number_player;i++){
                         
                    if(chatId == giocatore.player[i].name){                        
                         account_esistente = true;
                         console.log(giocatore.player[i].chapter);
                         chapter = giocatore.player[i].chapter-1;
                    }
               }
               if(account_esistente == true){
                    console.log("account esistente");
                    //per creare la stringa dei next_chapters
                    string = customer.chapters[chapter].next_chapters.toString();
                    super_string += "["+string+"]";

               }else{
                    console.log("account nuovo")
                    giocatore.player[number_player]=
                    {                          
                         number: number_player+1,
                         name: chatId,
                         chapter:1,
                         life: life
                    }
                                   
                    fs.writeFile('./giocatori.json', JSON.stringify(giocatore,null, 2), err => {
                         if (err) {
                              console.log('Error writing file giocatori.json', err)
                         } else {
                              console.log('Successfully wrote file giocatori.json')
                         }
                    })

                    //per creare la stringa dei next_chapters
                    string = customer.chapters[chapter].next_chapters.toString();
                    super_string += "["+string+"]";

                    bot.on('message', function onMessage(msg) {
                         bot.sendMessage(msg.chat.id, "Il gioco ha inizio! Benvenuto!");
                    });
               }
               bot.on('message', function onMessage(msg) {
                    bot.sendMessage(msg.chat.id, "CHAPTER: "+(chapter+1)+"\n"+"DESCRIPTION:\n"+customer.chapters[chapter].description+'\nDigita il numero del paragrafo per proseguire la storia.  '
                         +"\n"+super_string);
               });
               super_string = "";
          })    

     }else{
          bot.on('message', function onMessage(msg) {
               bot.sendMessage(msg.chat.id, 'Digitare "start" per cominciare a giocare');
          });

          /*
          axios.post(`${url}${apiToken}/sendMessage`,
               {
                    chat_id: chatId,
                    text: 'Digitare "start" per cominciare a giocare'
               })
               .then((response) => { 
                    res.status(200).send(response);
               }).catch((error) => {
                    res.send(error);
               });
          */
     }

     
});
    


// Listening
app.listen(port, () => {
     console.log(`Listening on port ${port}`);
});

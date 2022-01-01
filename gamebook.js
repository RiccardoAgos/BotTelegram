// Dependencies
//const Telegraf = require('telegraf');
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
//const numero_giocatori = require('./numeroGiocatori.json');

//create string
var string = "";
var super_string = "";

//TOKEN ='5047978121:AAFXPC7tvG7C82bmuakoaxo6z9HRsGYDtME';
//SERVER_URL='https://b2e4-80-104-141-187.ngrok.io';
// Configurations
app.use(bodyParser.json());

var number_player = 1,
     chapter = 100,
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


// Endpoints
app.post('/', (req, res) => {
     console.log(req.body);
     const chatId = req.body.message.chat.id;
     var sentMessage = req.body.message.text;

     // start game
     if (sentMessage == "start") {
          
          axios.post(`${url}${apiToken}/sendMessage`,
               {
                    chat_id: chatId,
                    text: 'Sei un nuovo giocatore? y/n'
               })
               .then((response) => { 
                    res.status(200).send(response);
               }).catch((error) => {
                    res.send(error);
               });

     }else{
          
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
     }
});




app.post('/', (req, res) => {
     console.log(req.body);
     const chatId = req.body.message.chat.id;
     let sentMessage = req.body.message.text;
     console.log(sentMessage);
     
     account_esistente = false;

     if(sentMessage == "y"){
          //lettura giocatore dentro al file giocatori.json
          //con controlllo del giocatore, in caso fosse già esistente
          //con stampa del capitolo in caso di nuovo giocatore, con 
          //annessa registrazione nel file giocatori.json
          jsonReader("./giocatori.json", (err, giocatore) => {
               if (err) {
                    console.log(err);
                    return;
               }

               number_player = giocatore.player.length;

               for(var i = 0;i < number_player;i++){
                    
                    if(chatId == giocatore.player[i].name){                        
                         account_esistente = true;
                    }
               }

               if(account_esistente == true){
                    console.log("account esistente");
                    axios.post(`${url}${apiToken}/sendMessage`,
                    {
                         chat_id: chatId,
                         text: 'ACCOUNT ESISTENTE, ripetere operazione'
                    })
                    .then((response) => { 
                         res.status(200).send(response);
                    }).catch((error) => {
                              res.send(error);
                    });
               }else{
                    console.log("account nuovo")
                    giocatore.player[number_player]=
                    {                          
                         number: number_player+1,
                         name: chatId,
                         chapter: 0,
                         life: life
                    }
                              
                    fs.writeFile('./giocatori.json', JSON.stringify(giocatore,null, 2), err => {
                         if (err) {
                             console.log('Error writing file giocatori.json', err)
                         } else {
                              console.log('Successfully wrote file giocatori.json')
                         }
                    })
                    var i, 
                         capitoli = customer.chapters[chapter].next_chapters.length;
                    
                    //per creare la stringa dei next_chapters
                    for(i = 0;i<capitoli;i++){
                         string = customer.chapters[chapter].next_chapters[i].toString();
                         super_string += "["+string+"]";
                         if((capitoli-i)!= 1){
                             super_string += "-";
                         }              
                    }
                         axios.post(`${url}${apiToken}/sendMessage`,
                         {
                              chat_id: chatId,
                              text: 'Il gioco ha inizio! Benvenuto!\n'+customer.chapters[chapter].description+'\nDigita il numero del paragrafo per proseguire la storia.  '
                              +"\n"+super_string
                         })
                         .then((response) => { 
                              res.status(200).send(response);
                         }).catch((error) => {
                              res.send(error);
                         });

                    super_string = "";
               }
          });
          
          

     }else{
          //ricerca del giocatore dentro al file giocatori.json tramite chatId
          jsonReader("./giocatori.json", (err, giocatore) => {
               if (err) {
                    console.log(err);
                    return;
               }

               number_player = giocatore.player.length;
               
               //per creare la stringa dei next_chapters
               for(var i = 0;i < number_player;i++){
                    if(chatId == giocatore.player[i].name){      
                         chapter = giocatore.player[i].chapter;        
                    }
               }
               if(chapter == 0){
                    //aggiungere condizione per capire di quale meccanica si tratta
                    
                    var i,
                         string = "",
                         capitoli = customer.chapters[chapter].next_chapters.length;

                    //per creare la stringa dei next_chapters
                    for(i = 0;i<capitoli;i++){
                         string = customer.chapters[chapter].next_chapters[i].toString();
                         super_string += "["+string+"]";
                         if((capitoli-i)!= 1){
                              super_string += "-";
                         }              
                    }
                    axios.post(`${url}${apiToken}/sendMessage`,
                    {
                         chat_id: chatId,
                         text: customer.chapters[chapter].description+'\nDigita il numero del paragrafo per proseguire la storia.  '
                         +"\n"+super_string
                         //+'\nDigita "/exit" per terminare il gioco'
                    })
                    .then((response) => { 
                           res.status(200).send(response);
                    }).catch((error) => {
                           res.send(error);
                    });
                    super_string = "";
               }else{
                    console.log("account non trovato")
                    axios.post(`${url}${apiToken}/sendMessage`,
                    {
                         chat_id: chatId,
                         text: 'ACCOUNT NON ESISTENTE, ripetere operazione'
                    })
                    .then((response) => { 
                         res.status(200).send(response);
                    }).catch((error) => {
                         res.send(error);
                    });
               }

          });
          
          
          
     }
});   



// Listening
app.listen(port, () => {
     console.log(`Listening on port ${port}`);
});

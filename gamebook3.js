process.env.NTBA_FIX_319 = 1;

// Dependencies
const express = require('express');
const app = express();
const axios = require('axios');
const bodyParser = require('body-parser');
const url = 'https://api.telegram.org/bot';
const PORT = 3000;
const TOKEN = '5047978121:AAFXPC7tvG7C82bmuakoaxo6z9HRsGYDtME';
const fs = require('fs');


// Importing the game file
const customer = require('./The_Chasm_of_Doom.json');

const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(TOKEN);

//create string
var string = "";
var super_string = "";

var buttonString = ["ciao","ciao1","ciao2","ciao3"];

// Configurations
app.use(bodyParser.json());

var number_player = 1,
     chapter = 0,
     life = 100,
     account_esistente = false;

//function for write on file
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

// We are receiving updates at the route below!
app.post('/', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Listening
app.listen(PORT, () => {
     console.log(`Listening on port ${PORT}`);
});

bot.on('message', function onMessage(msg) {
     console.log(msg);
     const chatId = msg.chat.id;
     var message = msg.text;
     console.log("testo inserito: "+message);

     jsonReader("./giocatori2.json", (err, giocatore) => {
               if (err) {
                    console.log(err);
                    return;
               }
               //new map with object of giocatori.josn
               var map = new Map(Object.entries(giocatore));
               //map structure
               //key = number
               //val[0] = chatId/name
               //val[1] = chapter
               //val[2] = life

               //number of players in the file 
               number_player = map.size; 

               //player_name takes the value of the specific map
               //convert assumes the momentary value of the i not numeric, 
               //but in the form of a string
               var player_name,
                   convert,
                   valore;

               //for loop to scroll the whole map
               for(valore = 0;valore < number_player;valore++){
                    convert = valore.toString();
                    player_name = map.get(convert);
                    //search the chatId, to see if the player exists
                    if(chatId == player_name.val[0]){                        
                         account_esistente = true;
                         chapter = player_name.val[1]-1;

                    }
               }

               if(account_esistente == true){
                    console.log("account esistente");

                    //conversion of the value entered from the keyboard
                    var messageInt = parseInt(message);
                    var count ;
                    var chapter_found = false;
                    var arr = customer.chapters[chapter].next_chapters;

                    for(count = 0;count < arr.length;count++){
                         if(messageInt == arr[count]){
                              chapter_found = true;
                         }

                    }
                    if(chapter_found == true){
                         console.log("capitolo corretto");

                         //check on flag_ending
                         if((customer.chapters[messageInt-1].flag_ending == true) || (customer.chapters[messageInt-1].flag_deadly == true)){

                          bot.sendMessage(chatId, "CHAPTER: "+(messageInt)+"\n"+"DESCRIPTION:\n"+customer.chapters[messageInt-1].description+'\nGAME BOOK COMPLETED, CONGRATULATIONS !!!');
                         }else{

                           //create a super_string
                           arr = customer.chapters[messageInt-1].next_chapters;
                           string = arr.toString();
                           super_string += "["+string+"]";
                          
                          //create a buttons
                          if(arr.length == 4 ){
                            for(i=0;i<4;i++){
                              buttonString[i]=arr[i].toString();
                          }
                          var opts = {
                                reply_to_message_id: msg.message_id,
                                reply_markup: JSON.stringify({
                                  keyboard: [
                                    [buttonString[0]],
                                    [buttonString[1]],
                                    [buttonString[2]],
                                    [buttonString[3]]
                                  ]
                                })
                             }
                          }else if(arr.length == 3 ){
                              for(i=0;i<3;i++){
                                buttonString[i]=arr[i].toString();
                              }
                              var opts = {
                                reply_to_message_id: msg.message_id,
                                reply_markup: JSON.stringify({
                                  keyboard: [
                                    [buttonString[0]],
                                    [buttonString[1]],
                                    [buttonString[2]]
                                  ]
                                })
                              }
                          }else if(arr.length == 2){
                              for(i=0;i<2;i++){
                                buttonString[i]=arr[i].toString();
                              }
                              var opts = {
                                  reply_to_message_id: msg.message_id,
                                  reply_markup: JSON.stringify({
                                    keyboard: [
                                      [buttonString[0]],
                                      [buttonString[1]]
                                    ]
                                  })
                              }
                          }else if(arr.length == 1){
                              for(i=0;i<1;i++){
                                buttonString[i]=arr[i].toString();
                              }
                              var opts = {
                                reply_to_message_id: msg.message_id,
                                reply_markup: JSON.stringify({
                                  keyboard: [
                                    [buttonString[0]]
                                  ]
                                })
                              }
                          }

                           bot.sendMessage(chatId, "CHAPTER: "+(messageInt)+"\n"+"DESCRIPTION:\n"+customer.chapters[messageInt-1].description+'\nType the paragraph number to continue the story.'
                                +"\n"+super_string,opts);
                           super_string = "";

                           //saving the new chapter for the player
                           valore--;
                           convert = valore.toString();
                           player_name = map.get(convert);
                           player_name.val[1] = messageInt;
                           map.set(convert,player_name);

                           var player = Object.fromEntries(map);

                           //write on file 
                           fs.writeFile('./giocatori2.json', JSON.stringify(player,null, 2), err => {
                              if (err) {
                                  console.log('Error writing file giocatori2.json', err)
                              } else {
                                  console.log('Successfully wrote file giocatori2.json')
                              }
                           })
                         }

                    }else{
                         console.log("capitolo errato");
                         
                         //create a super_string
                         string = customer.chapters[chapter].next_chapters.toString();
                         super_string += "["+string+"]";

                         bot.sendMessage(chatId, '\nType the paragraph number to continue the story.'
                              +"\n"+super_string);
                         super_string = "";

                         //saving the new chapter for the player
                         valore--;
                         convert = valore.toString();
                         player_name = map.get(convert);
                         player_name.val[1] = chapter;

                    }


               }else{
                    console.log("account nuovo")

                    var obj = {key:0,val:[chatId,1,life]};
                    obj.key = number_player+1;
                    map.set(number_player,obj);


                    //map transformation into object to write files
                    var player = Object.fromEntries(map);
                    
                    //write on file               
                    fs.writeFile('./giocatori2.json', JSON.stringify(player,null, 2), err => {
                         if (err) {
                              console.log('Error writing file giocatori.json', err)
                         } else {
                              console.log('Successfully wrote file giocatori.json')
                         }
                    })
                    var arr = customer.chapters[chapter].next_chapters;

                    //create a super_string
                    string = customer.chapters[chapter].next_chapters.toString();
                    super_string += "["+string+"]";

                    //create a buttons
                    if(arr.length == 4 ){
                      for(i=0;i<4;i++){
                        buttonString[i]=arr[i].toString();
                      }
                      var opts = {
                        reply_to_message_id: msg.message_id,
                        reply_markup: JSON.stringify({
                          keyboard: [
                            [buttonString[0]],
                            [buttonString[1]],
                            [buttonString[2]],
                            [buttonString[3]]
                          ]
                        })
                      }
                    }else if(arr.length == 3 ){
                      for(i=0;i<3;i++){
                        buttonString[i]=arr[i].toString();
                      }
                      var opts = {
                        reply_to_message_id: msg.message_id,
                        reply_markup: JSON.stringify({
                          keyboard: [
                            [buttonString[0]],
                            [buttonString[1]],
                            [buttonString[2]]
                          ]
                        })
                      }
                    }else if(arr.length == 2){
                      for(i=0;i<2;i++){
                        buttonString[i]=arr[i].toString();
                      }
                      var opts = {
                        reply_to_message_id: msg.message_id,
                        reply_markup: JSON.stringify({
                          keyboard: [
                            [buttonString[0]],
                            [buttonString[1]]
                          ]
                        })
                      }
                    }else if(arr.length == 1){
                      for(i=0;i<1;i++){
                        buttonString[i]=arr[i].toString();
                      }
                      var opts = {
                        reply_to_message_id: msg.message_id,
                        reply_markup: JSON.stringify({
                          keyboard: [
                            [buttonString[0]]
                          ]
                        })
                      }
                    }

                    bot.sendMessage(chatId, "The game begins! Welcome!\n"+"CHAPTER: "+(chapter+1)+"\nDESCRIPTION:\n"+customer.chapters[chapter].description+'\nType the paragraph number to continue the story.'
                         +"\n"+super_string);
                    super_string = "";
               }
               
          }
     )



});

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

//sendPhoto link foto copiato da internet
const photo = `https://www.google.it/imgres?imgurl=https%3A%2F%2Fwww.icegif.com%2Fwp-content%2Fuploads%2Ficegif-852.gif&imgrefurl=https%3A%2F%2Fwww.icegif.com%2Fthe-end-5%2F&tbnid=9_0j3Twpngh3AM&vet=12ahUKEwiwuub5y6z1AhVEwuAKHfwIA80QMygNegUIARCPAg..i&docid=CWj9mZn8pcrJxM&w=599&h=170&itg=1&q=gif%20the%20end&client=safari&ved=2ahUKEwiwuub5y6z1AhVEwuAKHfwIA80QMygNegUIARCPAg`;
const photo1 = `https://www.google.it/imgres?imgurl=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fen%2F3%2F36%2FLonewolflogo.jpg&imgrefurl=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FLone_Wolf_(gamebooks)&tbnid=fkdl2BQ1EiscgM&vet=12ahUKEwic_Zemz6z1AhWFt6QKHWxzCjQQMygMegUIARC9AQ..i&docid=hnFCty0FRjWu9M&w=501&h=199&itg=1&q=lone%20wolf%20logo&hl=it&client=safari&ved=2ahUKEwic_Zemz6z1AhWFt6QKHWxzCjQQMygMegUIARC9AQ`;


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

     if(message == "FINISH"){
      bot.sendMessage(chatId, "👋👋👋👋👋👋");
     }else{
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

                 //whether the account exists or not
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
                      //check on the inserted chapter
                      if(chapter_found == true){
                           console.log("capitolo corretto");

                          //check on flag_ending
                          if(customer.chapters[messageInt-1].flag_ending == true){
                            
                            opts = buttonOne(arr,msg.message_id);
                            //send message
                            bot.sendMessage(chatId, "CHAPTER: "+(messageInt)+"\n"+"DESCRIPTION:\n"+customer.chapters[messageInt-1].description,opts);
                            //send photo
                            bot.sendPhoto(chatId,photo,{caption: "THE GAME BOOK IS FINISHED!!\nTHANKS FOR READING!"});

                            //delete the player who completed the game
                            valore--;
                            convert = valore.toString();
                            map.delete(convert);
                            console.log(map);

                            var player = Object.fromEntries(map);

                            //call the writeFile function
                            writeFile(player);

                          }else if(customer.chapters[messageInt-1].flag_deadly == true){

                            opts = buttonOne(arr,msg.message_id);

                            //send message
                            bot.sendMessage(chatId, "CHAPTER: "+(messageInt)+"\n"+"DESCRIPTION:\n"+customer.chapters[messageInt-1].description+"\nYOU ARE DEAD!! \nTHANKS FOR READING!",opts);
                            //send audio
                            bot.sendAudio(chatId, '/Users/riccardoagostini/Desktop/testTesi2/alien-spaceship_daniel_simion.mp3');

                            //delete the player who completed the game
                            valore--;
                            convert = valore.toString();
                            map.delete(convert);
                            console.log(map);

                            var player = Object.fromEntries(map);

                            //call the writeFile function
                            writeFile(player); 
                             

                          }else{

                             arr = customer.chapters[messageInt-1].next_chapters;
                             
                             //call the createString function
                             super_string = createString(arr);

                             //call the button function
                             opts = button(arr,msg.message_id)

                             //send message
                             bot.sendMessage(chatId, "CHAPTER: "+(messageInt)+"\n"+"DESCRIPTION:\n"+customer.chapters[messageInt-1].description+'\nType the paragraph number to continue the story or press one of the buttons.'
                                  +"\n"+super_string,opts);
                             super_string = "";

                             //saving the new chapter for the player
                             valore--;
                             convert = valore.toString();
                             player_name = map.get(convert);
                             player_name.val[1] = messageInt;
                             map.set(convert,player_name);

                             var player = Object.fromEntries(map);

                             //call the writeFile function
                             writeFile(player);
                           }

                      }else{
                           console.log("capitolo errato");
                           
                           super_string = createString(arr);

                           //send message
                           bot.sendMessage(chatId, '\nType the paragraph number to continue the story or press one of the buttons.'
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

                      //call the writeFile function
                      writeFile(player);
                      
                      var arr = customer.chapters[chapter].next_chapters;

                      super_string = createString(arr);
                      opts = button(arr,msg.message_id)

                      //send photo
                      bot.sendPhoto(chatId,photo1,{caption: "THE GAMEBOOK BEGINS!!"});
                      //send message
                      bot.sendMessage(chatId,"CHAPTER: "+(chapter+1)+"\nDESCRIPTION:\n"+customer.chapters[chapter].description+'\nType the paragraph number to continue the story.'
                           +"\n"+super_string,opts);
                      super_string = "";
                 }
                 
            }
       )
    }
});

//function use to write the player on file
function writeFile(obj){
  //write on file               
  fs.writeFile('./giocatori2.json', JSON.stringify(obj,null, 2), err => {
    if(err){
      console.log('Error writing file giocatori.json', err)
    }else{
      console.log('Successfully wrote file giocatori.json')
    }
  })
}


//function use for create a string of next_chapters
function createString(arr){
  //create a super_string
  var string = "ciao";
  var word = "";
  string = arr.toString()
  word += "["+string+"]";
  return word;
}

//function use for create a button on telegram
function button(arr,msg){

  var buttonString = ["ciao","ciao1","ciao2","ciao3"];

  if(arr.length == 4 ){
    for(i=0;i<4;i++){
      buttonString[i]=arr[i].toString();
    }
    var opts = {
      reply_to_message_id: msg,
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
      reply_to_message_id: msg,
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
      reply_to_message_id: msg,
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
      reply_to_message_id: msg,
      reply_markup: JSON.stringify({
        keyboard: [
            [buttonString[0]]
        ]
      })
    }
  }
  return opts;
}

function buttonOne(arr,msg){
  buttonString[0] = "FINISH"
  var opts = {
    reply_to_message_id: msg,
    reply_markup: JSON.stringify({
      keyboard: [
        [buttonString[0]]
      ]
    })
  }
  return opts;
}

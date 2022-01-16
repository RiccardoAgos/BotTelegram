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

//sendPhoto (link copy of google)
const photo = `https://www.google.it/imgres?imgurl=https%3A%2F%2Fwww.icegif.com%2Fwp-content%2Fuploads%2Ficegif-852.gif&imgrefurl=https%3A%2F%2Fwww.icegif.com%2Fthe-end-5%2F&tbnid=9_0j3Twpngh3AM&vet=12ahUKEwiwuub5y6z1AhVEwuAKHfwIA80QMygNegUIARCPAg..i&docid=CWj9mZn8pcrJxM&w=599&h=170&itg=1&q=gif%20the%20end&client=safari&ved=2ahUKEwiwuub5y6z1AhVEwuAKHfwIA80QMygNegUIARCPAg`;
const photo1 = `https://www.google.it/imgres?imgurl=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fen%2F3%2F36%2FLonewolflogo.jpg&imgrefurl=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FLone_Wolf_(gamebooks)&tbnid=fkdl2BQ1EiscgM&vet=12ahUKEwic_Zemz6z1AhWFt6QKHWxzCjQQMygMegUIARC9AQ..i&docid=hnFCty0FRjWu9M&w=501&h=199&itg=1&q=lone%20wolf%20logo&hl=it&client=safari&ved=2ahUKEwic_Zemz6z1AhWFt6QKHWxzCjQQMygMegUIARC9AQ`;
//const photo2 = `https://www.google.it/url?sa=i&url=https%3A%2F%2Fwww.kindpng.com%2Fimgv%2FhRxiibJ_restart-button-png-transparent-png%2F&psig=AOvVaw3eyXbDx0s4KrwANM6kKLVf&ust=1642155367725000&source=images&cd=vfe&ved=0CAsQjRxqFwoTCMiLmM6_rvUCFQAAAAAdAAAAABAJ`;

var buttonString = ["ciao","ciao1","ciao2","ciao3"];

// Configurations
app.use(bodyParser.json());

var number_player = 1,
     chapter = 0,
     life = 100,
     account_esistente = false;

// We are receiving updates at the route below!
app.post('/', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Listening
app.listen(PORT, () => {
     console.log(`Listening on port ${PORT}`);
});


//command /restart 
bot.onText(/\/restart/, (msg) => {
  const chatId = msg.chat.id;

  jsonReader("./giocatori2.json", (err, giocatore) => {
    if (err) {
      console.log(err);
      return;
    }
    //new map with object of giocatori.josn
    //map structure
    //key = number
    //val[0] = chatId/name
    //   [1] = chapter
    //   [2] = life
    //   [3] = end
    //val2[0] = history
    var map = new Map(Object.entries(giocatore));

    //number of players in the file 
    number_player = map.size; 

    //player_name takes the value of the specific map
    //convert assumes the momentary value of the i not numeric, 
    //but in the form of a string
    var player_name,
        convert,
        valore;
    var obj = {key:0,val:[chatId,1,life,false],val2:[1]};;


    //for loop to scroll the whole map
    for(valore = 0;valore < number_player;valore++){
      convert = valore.toString();
      player_name = map.get(convert);
      //search the chatId, to see if the player exists
      if(chatId == player_name.val[0]){                        
        //set chapter = 1
        obj.key = valore+1;
        map.set(valore,obj);
      }
    }

    //map transformation into object to write files
    var player = Object.fromEntries(map);
    writeFile(player);

    //save array of next_chapters on arr
    var arr = customer.chapters[0].next_chapters;

    //call the createString function
    var super_string = createString(arr);

    //call the button function
    var opts = button(arr,msg.message_id)

    bot.sendMessage(chatId,
      "RESTART GAMEBOOK FOR (chat_id:"+chatId+
      ")\nCHAPTER: 1"+
      "\nDESCRIPTION:\n"+customer.chapters[0].description+
      '\nType the paragraph number to continue the story.'+
      "\n"+super_string,opts);
                
      super_string = "";
  });
});


//command /history 
bot.onText(/\/history/, (msg) => {
  const chatId = msg.chat.id;

  jsonReader("./giocatori2.json", (err, giocatore) => {
    if (err) {
      console.log(err);
      return;
    }

    //new map with object of giocatori.josn
    //map structure
    //key = number
    //val[0] = chatId/name
    //   [1] = chapter
    //   [2] = life
    //   [3] = end
    //val2[0] = history
    var map = new Map(Object.entries(giocatore));
      
    //number of players in the file 
    number_player = map.size; 

    //player_name takes the value of the specific map
    //convert assumes the momentary value of the i not numeric, 
    //but in the form of a string
    var player_name,
        convert,
        valore;

    var super_string ="";

    //for loop to scroll the whole map
    for(valore = 0;valore < number_player;valore++){

      convert = valore.toString();
      player_name = map.get(convert);

      //search the chatId, to see if the player exists
      if(chatId == player_name.val[0]){                        
        //create a super string
        for(var i = 0;i<(player_name.val2.length);i++){
          super_string = super_string+"CHAPTER:"+player_name.val2[i]+customer.chapters[player_name.val2[i]-1].description;
        }
      }
    }


    //call the button function da cambiare in restart
    var opts = buttonOne(msg.message_id)
    var file_name = "history_"+chatId+".txt";

    bot.sendMessage(chatId,"VISUALIZATION OF THE HISTORY",opts);

    fs.writeFile(file_name, JSON.stringify(super_string, null, 2), err => {
      if (err) {
        console.log('Error writing file', err)
      } else {
        console.log('Successfully wrote file')
      }
      bot.sendDocument(chatId, file_name);
    });

    super_string = "";
  });
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
    //map structure            
    //key = number            
    //val[0] = chatId/name            
    //   [1] = chapter
    //   [2] = life
    //   [3] = end
    //val2[0] = history            
    var map = new Map(Object.entries(giocatore));           
                 

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
      var arr = customer.chapters[chapter].next_chapters;
                    
      //conversion of the value entered from the keyboard
      var messageInt = parseInt(message);
      var count ;
      var chapter_found = false;
                      

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
                            
          opts = buttonTwo(msg.message_id);
          //send message
          bot.sendMessage(chatId,
            "CHAPTER: "+(messageInt)+
            "\nDESCRIPTION:\n"+customer.chapters[messageInt-1].description,opts);
          //send photo
          bot.sendPhoto(chatId,photo,{caption: "THE GAME BOOK IS FINISHED!!\nTHANKS FOR READING!"});

          //add chapter
          valore--;
          convert = valore.toString();
          player_name = map.get(convert);
          player_name.val[1] = messageInt;
          player_name.val[3] = true;
                            
          //for create array of chapter                  
          var long = player_name.val2.length;
          player_name.val2[long]=customer.chapters[messageInt-1].number;
                            
          //set map
          map.set(convert,player_name);
          console.log(map);

          //trasform map in object
          var player = Object.fromEntries(map);

          //call the writeFile function
          writeFile(player);

        }else if(customer.chapters[messageInt-1].flag_deadly == true){

          opts = buttonTwo(msg.message_id);

          //send message
          bot.sendMessage(chatId,
            "CHAPTER: "+(messageInt)+
            "\n"+"DESCRIPTION:\n"+customer.chapters[messageInt-1].description+
            "\nYOU ARE DEAD!! \nTHANKS FOR READING!",opts);
                            
          //send audio
          bot.sendAudio(chatId, '/Users/riccardoagostini/Desktop/testTesi2/alien-spaceship_daniel_simion.mp3');

          //add chapter
          valore--;
          convert = valore.toString();
          player_name = map.get(convert);
          player_name.val[1] = messageInt;
          player_name.val[3] = true;
                            
                            
          var long = player_name.val2.length;
          player_name.val2[long]=customer.chapters[messageInt-1].number;
                            
          map.set(convert,player_name);
          console.log(map);

          var player = Object.fromEntries(map);

          //call the writeFile function
          writeFile(player); 
                             
        }else{

          //save array of next_chapters on arr
          arr = customer.chapters[messageInt-1].next_chapters;
                             
          //call the createString function
          super_string = createString(arr);

          //call the button function
          opts = button(arr,msg.message_id);

          //send message
          bot.sendMessage(chatId, "CHAPTER: "+(messageInt)+
            "\n"+"DESCRIPTION:\n"+customer.chapters[messageInt-1].description+
            "\nType the paragraph number to continue the story or press one of the buttons."+
            "\n"+super_string,opts);
                            
          super_string = "";


          //saving the new chapter for the player and add chapter
          valore--;
          convert = valore.toString();
          player_name = map.get(convert);
          player_name.val[1] = messageInt;
          
          //size of player_name.val2                                   
          var long = player_name.val2.length;
          player_name.val2[long]=customer.chapters[messageInt-1].number;
                            
          map.set(convert,player_name);

          //map transformation into object to write files
          var player = Object.fromEntries(map);

          //call the writeFile function
          writeFile(player);
        }
      }else{
        console.log("capitolo errato");
        if((message != "/restart") && (message != "/history") && (player_name.val[3] != true)) {
                           
          //call the createString function
          super_string = createString(arr);

          //call the button function
          opts = button(arr,msg.message_id);

          //send message
          bot.sendMessage(chatId, 
            "\nType the paragraph number to continue the story or press one of the buttons."+
            "\n"+super_string,opts);
                          
          super_string = "";

          //saving the new chapter for the player
          valore--;
          convert = valore.toString();
          player_name = map.get(convert);
          player_name.val[1] = chapter;
        }else{
          bot.sendMessage(chatId,"You have finish the gamebook.\nType or press '/restart' to have fun again.");
        }
      }
                    
    }else{
      console.log("account nuovo");
      newPlayer(map,number_player,chatId,msg.message_id,photo1);

    }
                 
  })
});



//FUNCTION 

function newPlayer(map,number_player,chatId,msg,photo1){

  //setting a new player
  var obj = {key:0,val:[chatId,1,life,false],val2:[1]};
  obj.key = number_player+1;
  map.set(number_player,obj);

  //map transformation into object to write files
  var player = Object.fromEntries(map);

  //call the writeFile function
  writeFile(player);
                      
  //save array of next_chapters on arr
  var arr = customer.chapters[0].next_chapters;

  //call the createString function
  var super_string = createString(arr);
  //call the button function
  var opts = button(arr,msg)

  //send photo
  bot.sendPhoto(chatId,photo1,{caption: "THE GAMEBOOK BEGINS!!"});
  //send message
  bot.sendMessage(chatId,
  "CHAPTER: "+(chapter+1)+
  "\nDESCRIPTION:\n"+customer.chapters[chapter].description+
  "\nType the paragraph number to continue the story.\n"
  +super_string,opts);
                      
  super_string = "";
}

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

function buttonTwo(msg){
  buttonString[0] = "/history";
  buttonString[1] = "/restart";
  var opts = {
    reply_to_message_id: msg,
    reply_markup: JSON.stringify({
      keyboard: [
        [buttonString[0]],
        [buttonString[1]]
      ]
    })
  }
  return opts;
}

function buttonOne(msg){
  buttonString[0] = "/restart"
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

/*
  -lettura file customer.json, acquisizione dei dati contenuti su customer.json,
  aggiunta di un nuovo elemento alla map e scrittura della nuova map su file customer.json

  -simulazione che andrà poi implementata nel file gamebook2.js per gestire
  lettura e scrittura (dei giocatori) sul file giocatori.js tramite map
*/

const fs = require('fs');

//metodo per la gestione del file
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

//varibile di calcolo per key
var num = 0;

//oggetto obj
//key il numero del giocatore 
//val che rappresenta capitolo, vita e chatId (se fossimo nel gamebook)
var obj = {key:0,val:[11,"dodici","tredici"]};

//new array map
var result = new Map();

//lettura file customer.json
jsonReader("./customer.json", (err, customer) => {
  if (err) {
    console.log(err);
    return;
  }
  //ciclo for di lettura del file customer.json
  // e fase di assegnamento valore a result tramite set()
  for (const [key,value] of customer.entries()) {
  	result.set(key,value);

  	//conteggio elementi interni al file customer.json, 
    //più 1 per far si che non si sovrappongano i dati
  	num = key+1;
  }
  //assegnamento valore obj
  obj.key = num;


  console.log(result);

  //aggiunto nuovo elemento a result
  //per simulare l'aggiunta di un nuovo giocatore sul file giocatori.json 
  //(gamebook)
  result.set(num,obj)

  console.log(result);

  //scrivo nel file il nuovo giocatore
  fs.writeFile('./customer.json', JSON.stringify(result,null,2), err => {
    if (err) {
        console.log('Error writing file', err)
    } else {
        console.log('Successfully wrote file')
    }
  })

});


/*
//esempio di file  customer
[
	{
	 "key":1, 
	 "val":[2,"tre","quattro"]
	},
	{
	 "key":2, 
	 "val":[5,"sei","sette"]
	},
	{
	 "key":3, 
	 "val":[8,"nove","dieci"]
	}
]
*/

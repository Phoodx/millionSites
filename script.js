const fs = require('fs');
const csv = require('csvtojson');
const { domain } = require('process');
const http = require('https');

callBackAfterDownload = () => {
 const csvFilePath='millionSites.csv'
 const todaysDate = new Date();
// Parse CSV into JSON
    csv()
    .fromFile(csvFilePath)
    .then((jsonObj)=>{
      const fetchedList = Array.from(jsonObj.map(obj => obj.Domain));
      fs.readFile('masterList.csv', 'utf8', (err, data) => {
        if (err) {
          console.error(err)
          return
        }
        const masterArray = data.split(',');

          let sortingTimeStart = new Date();
          console.log(`parsing for uniques - started-at ${sortingTimeStart.getHours()}:${sortingTimeStart.getMinutes()}`)
          let uniques = fetchedList.filter((o) => masterArray.indexOf(o) === -1);

          let sortingTimeEnd = new Date();
          console.log(`parsing for uniques -completed-at ${sortingTimeEnd.getHours()}:${sortingTimeEnd.getMinutes()}`)
         
          console.log(`uniques`, uniques);
          if(uniques.length > 0) {
            fs.writeFile(`${todaysDate.getMonth()}-${todaysDate.getDate()}_${todaysDate.getHours()}-${todaysDate.getMinutes()}-UDs`, uniques, function (err) {
              if (err) throw err;
              console.log('Saved!');
            });

          }else{
            console.log(`0 uniques to save `)
          }
          saveCB = () => console.log(`apended-#${uniques.length}-uniques-to-master-list`);

          if(masterArray.length > 10 ) {
            
            fs.writeFile('masterList.csv', masterArray.concat(uniques), saveCB)
          } else {
            
            fs.writeFile('masterList.csv', uniques, saveCB)
          }

      })
    })
  }

var download = function(url, dest, cb) {
  let dlStartTime = new Date()
  console.log(`dl-started-at-${dlStartTime.getHours()}:${dlStartTime.getMinutes()}`)
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      let dlTime = new Date()
      console.log(`dl-completed-at-${dlStartTime.getHours()}:${dlStartTime.getMinutes()}`)
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};

download("https://downloads.majestic.com/majestic_million.csv", 'millionSites.csv', callBackAfterDownload )
// callBackAfterDownload()
// afterSaveCB()
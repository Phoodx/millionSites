const fs = require('fs');
const csv = require('csvtojson');
const { domain } = require('process');
const http = require('https');
const fetch = require('node-fetch');
const cheerio = require('cheerio');


callBackAfterDownload = () => {
 const csvFilePath='millionSites.csv'
 
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
        // Fetch Majestic's Date of Refresh
        fetch('https://majestic.com/reports/majestic-million')
        .then(res => res.text())
        .then(body => {
            const $ = cheerio.load(body);
            const majesticrefreshDate = $("#content_container").find(".contentPanelWhite p").text();
            const mRefreshDate = new Date(majesticrefreshDate.slice(-30))
            console.log('mRefreshDate', mRefreshDate)
            // split into array > the file which is now > data
            const masterArray = data.split(',');
    
              let sortingTimeStart = new Date();
              console.log(`parsing for uniques - started-at ${sortingTimeStart.getHours()}:${sortingTimeStart.getMinutes()}`)
              let uniques = fetchedList.filter((o) => masterArray.indexOf(o) === -1);
    
              
              let sortingTimeEnd = new Date();
              console.log(`parsing for uniques -completed-at ${sortingTimeEnd.getHours()}:${sortingTimeEnd.getMinutes()}`)
             
              console.log(`uniques`, uniques);
              if(uniques.length > 0) {
                // if there are uniques , save em in their own file with the Majestic-Refresh-Date as the name
                fs.writeFile(`./Uniques/${mRefreshDate.getMonth()}-${mRefreshDate.getDate()}-new-domains`, uniques, function (err) {
                  if (err) throw err;
                  console.log('Saved!');
                });
    
              }else{
                console.log(`0 uniques to save `)
              }
              saveCB = () => console.log(`apended-#${uniques.length}-uniques-to-master-list`);
    
              if(masterArray.length > 10 ) {
                // if its not first time runninig script
                fs.writeFile('masterList.csv', masterArray.concat(uniques), saveCB)
              } else {
                // if its the first time runninig script
                fs.writeFile('masterList.csv', uniques, saveCB)
              }




        }).catch(console.error);

      })
    })




  }

var download = function(url, dest, cb) {
  // Check if Uniques File with same date as Refresh dat exsists.
  fetch('https://majestic.com/reports/majestic-million')
  .then(res => res.text())
  .then(body => {
      const $ = cheerio.load(body);
      const majesticrefreshDate = $("#content_container").find(".contentPanelWhite p").text();
      const mRefreshDate = new Date(majesticrefreshDate.slice(-30))
      const prefix = `${mRefreshDate.getMonth()}-${mRefreshDate.getDate()}`;
      const fileNameToFind = prefix + `-new-domains`;

      const folder = './Uniques/';

            
      if(!fs.readdirSync(folder).includes(fileNameToFind)) {
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


      } else {
         // Stale Data, wait for Majestic to refresh.
         console.log(`Stale Data, wait for Majestic to refresh.`)
      }

  });

};

      




download("https://downloads.majestic.com/majestic_million.csv", 'millionSites.csv', callBackAfterDownload ) 

// callBackAfterDownload()

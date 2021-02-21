const fetch = require('node-fetch');
const cheerio = require('cheerio');

fetch('https://majestic.com/reports/majestic-million')
    .then(res => res.text())
    .then(body => {
        const $ = cheerio.load(body);
        const majesticrefreshDate = $("#content_container").find(".contentPanelWhite p").text();
        console.log('majesticrefreshDate', new Date(majesticrefreshDate.slice(-30)))
    });
var Xray = require('x-ray');
var csv = require('fast-csv');
var fs = require('fs');
var async = require('async');
var shirtData = [];
var xray = Xray({
  filters:{
    slice: function (value, start , end) {
      return typeof value === 'string' ? value.slice(start, end) : value;
    }
  }
});

var getShirtLinks = function() {
  xray('http://www.shirts4mike.com/shirts.php', '.products', ['a@href'])(function(error,data) {
      if (data) {
        getShirtData(data);
      } else {
        console.log("error getting t-shirt links: " + error);
      }
    }
  );
};

var getShirtData = function(links) {
  async.each(links, shirtDataCall, function(err) {
    exportToCSV(shirtData);
  });
};

var shirtDataCall = function(link, finished) {
  xray(link, {
        image: '.shirt-picture img@src',
        price: '.price',
        title: '.shirt-details h1 | slice:4'
      })(function(error,data) {
        if (data) {
          data.url = link;
          shirtData.push(data);
          return(finished(null));
        } else {
          console.log("error getting t-shirt data: " + error);
        }
      }
    );
};

var exportToCSV = function(object) {
  var today = new Date();
  var month = today.getMonth() + 1;
  var day = today.getDate();
  var year = today.getFullYear();
  var hours = today.getHours();
  var minutes = today.getMinutes();
  var seconds = today.getSeconds();
  var date = month + '-' + day + '-' + year;
  var time = hours + ':' + minutes + ':' + seconds;
  
  try {
    fs.statSync("./data/");
  } catch(e) {
    fs.mkdirSync("./data/");
  }
  
  var csvStream = csv.createWriteStream({headers: true}),
  writableStream = fs.createWriteStream("./data/" + date + ".csv");
  csvStream.pipe(writableStream);
  for (a = 0; a < object.length; a++) {
    var shirt = object[a];
    csvStream.write({Title: shirt.title, Price: shirt.price, ImageURL: shirt.image, URL: shirt.url, Time: time});
  }
  csvStream.end();
  console.log('web crawl completed at: ' + time);
  shirtData = [];
};

function scraper() {
  getShirtLinks();
  setTimeout(scraper, 5000);
}

scraper();
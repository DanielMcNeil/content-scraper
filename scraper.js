// dependencies
var Xray = require('x-ray');
var csv = require('fast-csv');
var fs = require('fs');
var async = require('async');

// xray options
// this one slices the price off of the beginning of the tshirt title, since price is captured separatly
var xray = Xray({
  filters:{
    slice: function (value, start , end) {
      return typeof value === 'string' ? value.slice(start, end) : value;
    }
  }
});

// array to hold tshirt data
var shirtData = [];

// get current date-time
var getDateTime = function() {
  var today = new Date();
  var month = today.getMonth() + 1;
  var day = today.getDate();
  var year = today.getFullYear();
  var hours = today.getHours();
  var minutes = today.getMinutes();
  var seconds = today.getSeconds();
  var date = month + '-' + day + '-' + year;
  var time = hours + ':' + minutes + ':' + seconds;
  
  return [date,time,today];
};

// use xray to get links to tshirts
var getShirtLinks = function() {
  xray('http://www.shirts44mike.com/shirts.php', '.products', ['a@href'])(function(error,data) {
      if (data) {
        getShirtData(data);
      } else {
        // log any errors to error log file and console
        // each error will be added as a new line
        var timeStamp = getDateTime("datetime");
        var message = "error getting t-shirt links: " + error + " at " + timeStamp[2] + '\n';
        fs.appendFile('scraper-error.log', message, function(error) {
          if (error) {
            console.log ('error log not written for some reason');
          }
        });
        console.log("error getting t-shirt links: " + error);
      }
    }
  );
};

// iterate through list of links to get required data for each tshirt
// async will iterate through each link, calling the shirtDataCall function on each one
// exportToCSV function will run after async has iterated through all list items
var getShirtData = function(links) {
  async.each(links, shirtDataCall, function(err) {
    exportToCSV(shirtData);
  });
};

// use xray to get required data for each tshirt
// finished parameter represents a callback function to let async know when all items are iterated through
// it is returned with null to indicate there were no errors
var shirtDataCall = function(link, finished) {
  xray(link, {
        image: '.shirt-picture img@src',
        price: '.price',
        title: '.shirt-details h1 | slice:4'
      })(function(error,data) {
        if (data) {
          // add url for the page to the data object and push data object to the shirtData array
          data.url = link;
          shirtData.push(data);
          return(finished(null));
        } else {
          // log any errors to error log file and console
          // each error will be added as a new line
          var timeStamp = getDateTime("datetime");
          var message = "error getting t-shirt data: " + error + " at " + timeStamp[2] + '\n';
          fs.appendFile('scraper-error.log', message, function(error) {
            if (error) {
              console.log ('error log not written for some reason');
            }
          });
          console.log("error getting t-shirt data: " + error);
        }
      }
    );
};

var exportToCSV = function(object) {
  var datetime = getDateTime();
  
  // check if data directory exists.  if not, create it
  // this has to be done syncronously or fs will try to write to the data directory before it is created
  try {
    fs.statSync("./data/");
  } catch(e) {
    fs.mkdirSync("./data/");
  }
  // write data for each tshirt to a csv with today's date as a file name
  // if more than one write is done in the same day, the most current will overwrite the others
  var csvStream = csv.createWriteStream({headers: true}),
  writableStream = fs.createWriteStream("./data/" + datetime[0] + ".csv");
  csvStream.pipe(writableStream);
  for (a = 0; a < object.length; a++) {
    var shirt = object[a];
    csvStream.write({Title: shirt.title, Price: shirt.price, ImageURL: shirt.image, URL: shirt.url, Time: datetime[1]});
  }
  csvStream.end();
  
  // when finished, indicate that on the console and clear the shirtData array
  console.log('web crawl completed at: ' + datetime[1]);
  shirtData = [];
};

// initalizes the application and runs it every 24 hours (86,400,000ms)
function scraper() {
  getShirtLinks();
  setTimeout(scraper, 86400000);
}

scraper();
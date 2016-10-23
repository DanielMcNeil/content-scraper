var Xray = require('x-ray');
var xray = Xray();
 
xray('http://www.shirts4mike.com/shirts.php', '.products', ['a@href'])
  (function(error,data) {
   for (a = 0; a < data.length; a++) {
     console.log(data[a]);
     xray(data[a], {
        image: '.shirt-picture img@src',
        price: '.price',
        title: '.shirt-details h1'
      })
      (function(error,data) {
        console.dir(data);
      });
    }
  }
);

// for (l = 0; l < links; l++) {
      
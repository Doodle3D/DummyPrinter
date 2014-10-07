//var app = require('express')();
//var http = require('http').Server(app);
//var io = require('socket.io')(http);

//var socket = require('socket.io');
var express = require('express');
var app = express();
var http = require('http');
var httpServer = http.Server(app);
//var httpServer = require('http').Server(app);
var io = require('socket.io')(httpServer);
var bodyParser = require('body-parser');
var fs = require('fs');
//var spawn = require('child_process').spawn;
var stljs = require('stljs');
var validUrl = require('valid-url');

//default namespace
io.on('connection', function(socket) {
  console.log('a user connected');
 
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
 
  socket.on('chat message', function(msg){
    console.log(msg);
    io.emit('chat message', msg);
  });
});
 
///////// OTHER NAMESPACE
io.of("/printers").on('connection', function(socket) {

  setTimeout(function() {
    console.log("list");
    socket.emit("list",printerIDs);
  },2500);


  for (var i in printerIDs) {
    socket.emit("appeared",printerIDs[i]);
  }
 
  socket.on('connect', function(){
    console.log('user connected');
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on("remove", function(data,cb) {
      console.log("remove",data.id);
      printerIDs.splice(data.id,1); //hift(); //fixme
      // console.log(printerIDs);
      cb("done");
    });

  socket.on("add", function(data,cb) {
      //printerIDs.push(printerIDs.length);
      //printers.push({})
      printerIDs.push({id:printer0.id, name:printer0.name});
      printers.push(printer0);

      //console.log("remove",data.id);
      //printerIDs.splice(data.id,1); //hift(); //fixme
      // console.log(printerIDs);
      cb("done");
    });

});

io.of("/0").on('connection', function(socket) {
    socket.emit("info",printer0);

    socket.on("saveSettings", function(data) {
      console.log("saveSettings (does nothing yet)");
      //printer0.name = data.name;
    });

    socket.on("getNetworks", function(data,cb) {
      cb(networks);
    });
});

io.of("/1").on('connection', function(socket) {
    socket.emit("info",printer1);
});

io.of("/pairing").on('connection', function(socket) {
    socket.emit("list",printers);
    //socket.emit("printerState",{state:"connected"});
});

io.of("/localprinters").on('connection', function(socket) {
  console.log('localprinters->list');
  socket.emit('list',{printers:printers});
})

// io.of("/network").on('connection', function(socket) {
//     //socket.emit("list",printers);
//     //socket.emit("printerState",{state:"connected"});
// });
 
app.use(express.static(__dirname, '/'));
app.use(bodyParser.json());


var download = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  //var request = 
  http.get(url, function(response) {
    if (response.statusCode==200) {
      response.pipe(file);
      file.on('finish', function() {
        file.close(cb);
      });
    } else {
      cb("Error http status="+response.statusCode);
    }
  });
};

var convertStl = function(stlFilename, pngFilename, cb) {
  stljs.imageify(stlFilename, { width: 800, height: 500, dst: pngFilename }, cb); //cb(err, povOutput, name)
};

var sendPNG = function(res, pngFilename, cb) {
  fs.readFile(pngFilename, function(err, data) {
    
    if (err) {
      cb(err);
      return;
    }

    console.log("ok, send png");
    res.writeHead(200, {'Content-Type': 'image/png'});
    res.end(data); // Send the file data to the browser.

    cb();
  });
};
        
app.get('/stl', function(req, res){
  console.log("STL");
  console.log(req.query);
  
  var stlFilename = req.query.url;
  var pngFilename = 'teapot.png';

  if (validUrl.isUri(stlFilename)){
    // console.log('Looks like an URI, trying to download file');

    download(stlFilename, "file.stl", function(err) {

      if (err) {
        return res.send('Error downloading '+stlFilename+" "+err);
      }

      console.log("download complete");

      stlFilename = "file.stl";

      convertStl(stlFilename, pngFilename, function(err, povOutput, name) {
        console.log("convert complete"); //,err,povOutput,name)

        sendPNG(res, pngFilename, function(err) {
          if (err) {
            return res.send('Error sending PNG '+pngFilename+" "+err);
          } 

          console.log("ok!");
          // return res.send('ok');

        });
      });

      //
    });

  } else {

    return res.send('Not a URI, is it a local file?');
  }
});



httpServer.listen(8080, function(){
  console.log('listening on *:8080');
});

var printer0 = {
  id:0,
  name:"Ultimaker-F1A23B",
  file:"robot_v2_support.stl",
  network:"VechtclubXL F1.19",
  state:"printing",
  printTimeRemaining:"2:45 minutes left",
  printProgress:30
};

var printer1 = {
  id:1,
  name:"Ultimaker-ABBA79",
  network:"VechtclubXL F1.19",
  state:"idle",
  printTimeRemaining:"about 2 hours left",
  printProgress:50
};

var printers = [ printer0, printer1 ];
var printerIDs = [
  {id:printer0.id, name:printer0.name},
  {id:printer1.id, name:printer1.name}
];

var networks = [
  {ssid:"FabLab Amersfoort",secured:true},
  {ssid:"VechtclubXL F1.19",secured:true},
  {ssid:"sitecom",secured:false},
  {ssid:"Ziggo23123",secured:true}
];

var socket = require('socket.io')
var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var printer = {
  id: 0,
  name: "Ultimaker-F1A23B"
}

var networks = [
  {ssid:"FabLab Amersfoort",security:['secured']},
  {ssid:"VechtclubXL F1.19",security:['secured']},
  {ssid:"sitecom",security:['none']},
  {ssid:"Ziggo23123",security:['none']}
];

//default namespace
io.on('connection', function(socket) {
  console.log('a user connected');
 
  io.emit('name', printer);

  // socket.on('getNetworks', function(cb) {
  //   cb(networks);
  // });

  // setTimeout(function() {
  //   console.log("emit: joined");
  //   socket.emit("joined",networks[0]);
  // },2500);

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
 
});

//default namespace
io.of("/network").on('connection', function(socket) {
  console.log('a user connected to /network');

  socket.on('getNetworks', function(cb) {
    //console.log("getNetworks");
    console.log("networks:",networks);
    cb(null,{"networks":networks});
  });

  socket.on('joinNetwork', function(data) { //no cb possible because connection disappears
    console.log("join:",data);
    //printer needs to register at the server or supply it's private code
    // if (cb) cb();
  })

});

app.get('/', function(req, res){
  res.send('Please connect using socket.io');
});

http.listen(8081, function(){
  console.log('accesspoint listening on *:8081');
});
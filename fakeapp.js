var host = "http://cloud.doodle3d.com:5000";
var io = require('socket.io-client');
var key = "545d02307b2bfaad1934cf39AICaqU99M5GsDPvoCnJr";
var nsp = "printers";
var url = host+"/"+nsp+"?key="+key;
var socket = io.connect(url);

socket.on("connect", function() {
  console.log("connected:",url);

  socket.on("appeared", function(data) {
    console.log("appeared:",data.id,data.online);
  })

  socket.on("changed", function(data) {
    console.log("changed:",data.id);
  })

  socket.emit('add',{id:'545f791422ed476034457a86'},function(err,data) {
    console.log('add cb',err,data);
  });

  // socket.emit('remove',{id:'545d097d0f62f7cb2622c4ff'},function(err,data) {
  //   console.log('remove cb',err,data);
  // });  
})






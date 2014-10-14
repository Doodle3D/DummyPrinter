var host = "http://cloud.doodle3d.com:5000";
var io = require('socket.io-client');
var key = "5437f4c9cbbba911461804b8TieszdrV6JTVi72f1ShS";
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

})




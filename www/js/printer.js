var Printer = function(name) {
  this.URL = "https://cloud.doodle3d.com";
  this.name = name || "BrowserPrinter";
  this.features = ["printer","network","debug","update","config","webcam","slicer"];
  this.id = "";
  this.key = "";
}

Printer.prototype.register = function(callback) {
  var url = this.URL+"/printer/register";
  var data = { name: this.name, features: this.features }
  var printer = this;

  $.post(url, data, function(res) {
    console.log("post response: ",res,"self: ",printer);
    printer.id = res.id;
    printer.key = res.key;
    if (callback) callback();
  });

}

Printer.prototype.connect = function(nsp,callback) {
  var url = this.URL+nsp+'?key='+this.key+"&type=printer";
  var socket = io(url, {forceNew:true});

  if (!socket.connected) {
    socket.once('connect',function() {
      console.log(nsp+": connected");
      if (callback) callback(null,socket);
    });

    socket.once('error',function(err) {
      console.log(nsp+": error: ",err);
      if (callback) callback(err);
    });
  }
  return socket;
}


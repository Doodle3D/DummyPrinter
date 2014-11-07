var keypress = require('keypress');
var debug = require('debug')('fakeprinter');
var spawn = require('child_process').spawn
var ss = require('socket.io-stream');
var fs = require('fs');

var PORT = process.env.PORT ? process.env.PORT : 5000;

var CLOUD_URL = "http://cloud.doodle3d.com:"+PORT;
var printer = require("./mock/printer")(CLOUD_URL);
var printerID;
var printerKey;
var nspPrinterRoot;
var nspPrinterPrinter;
var nspPrinterWebcam;
// var webcamEnabled = false;

var printerKey = '543bc6638b6a35696f459cdcdS0kgkKzSg2IehJke9uM';
var printerID = '543bc6638b6a35696f459cdc';

// printer.register(function(err,printerKey,printerID) {
//   console.log(err,printerKey,printerID);
//   process.exit();
// });

// console.log(process.env);

if (process.env['_']=='/opt/local/bin/nodemon') {
  console.log("using nodemon, keyboard interaction disabled");
} else {
  console.log('not using nodemon, keyboard interaction enabled')
  console.log('launcher',process.env['_']);
  // make `process.stdin` begin emitting "keypress" events
  keypress(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  connect();
}

  
function setState(state) {
  console.log(!!nspPrinterRoot,!!nspPrinterRoot,state);
  if (nspPrinterRoot) nspPrinterRoot.emit("printerState", {state: state});
  if (nspPrinterPrinter) nspPrinterPrinter.emit("state", {state: state});
}

process.stdin.on('keypress', function (ch, key) {
  //console.log('got "keypress"', key);
  
  if (!key) return;

  if (key.name == 'p') {
    console.log("emit state=print");
    setState('printing');
  }
  if (key.name == 'q') {
    console.log("emit state=idle");
    setState('idle');
  }
  if (key.name == 'd') {
    console.log("nspPrinterRoot disconnect");
    nspPrinterRoot.disconnect();
    nspPrinterPrinter.disconnect();
    nspPrinterWebcam.disconnect();

    // nspPrinterRoot = null;
    // nspPrinterPrinter = null;
    // nspPrinterWebcam = null;
  }

  if (key.name == 'r') {
    console.log("nspPrinterRoot + nspPrinterPrinter reconnect");
    connect();
  }

  if (key.ctrl && key.name == 'c') {
    process.exit();
  }

  // process.stdout.write(key);
});

function connect() {

  printer.connectTo("/"+printerID,printerKey,{forceNew:true},function(err,nsp) {
    if(err) throw new Error(err);
    nspPrinterRoot = nsp;

    console.log("fake /"+printerID + " emit printerState & clientSSID");

    // nsp.emit("printerState", {state: "idle"});
    setState('idle');
    nsp.emit("clientSSID",{ssid:"Vechtclub XL F1.19"});
  });  

  printer.connectTo("/"+printerID+"-printer",printerKey,{forceNew:true},function(err,nsp) {
    if (err) throw new Error(err);
    // if (!nsp) throw new Error("Error /"+printerID+"-printer namespace is not ready");

    nspPrinterPrinter = nsp;

    nsp.on("print",function(data,cb,stream) {
      console.log("onPrint",data,cb,stream);
      setState('printing');
      if (cb) cb(null,"ok");
    });

    nsp.on("stop",function(data,cb,stream) {
      console.log("onStop",data,cb,stream);
      if (cb) cb(null,"ok");
      setState('idle');
    });
  });

  printer.connectTo("/"+printerID+"-webcam",printerKey,{forceNew:true},function(err,nsp) {
    if (err) throw new Error(err);
    nspPrinterWebcam = nsp;

    // nsp.on("start", function() {
    //   console.log("start webcam");
    //   webcamEnabled = true;
    // });

    // nsp.on("stop", function() {
    //   console.log("stop webcam");
    //   webcamEnabled = false;
    // });

  });
}

setInterval(function() {  
  // if (!nspPrinterWebcam.connected) return;

  console.log('tick cam');
  var snapshot = spawn('imagesnap', ['-'])
  var convert = spawn('convert', ['-', '-quality', '10', 'JPEG:-'])
  var stream = ss.createStream();
  ss(nspPrinterWebcam).emit('image', stream); //// why in the HostModule repo: 'image', {}, stream ????
  snapshot.stdout.pipe(convert.stdin);
  convert.stdout.pipe(stream);

},500);

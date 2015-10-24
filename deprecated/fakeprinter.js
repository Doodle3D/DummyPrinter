var keypress = require('keypress');
var debug = require('debug')('fakeprinter');
var spawn = require('child_process').spawn
var ss = require('socket.io-stream');
var fs = require('fs');

// var PORT = process.env.PORT ? process.env.PORT : 5000;

var CLOUD_URL = "https://cloud.doodle3d.com"; //:"+PORT;
var printer = require("./mock/printer")(CLOUD_URL);
var printerID;
var printerKey;
var nspPrinterRoot;
var nspPrinterPrinter;
var nspPrinterWebcam;
var nspPrinterSlicer;
// var webcamEnabled = false;

var printerKey = '545f791422ed476034457a86rWKh8rkXIcQMDWK5zD8R';
var printerID = '545f791422ed476034457a86';

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

function print() {

  console.log("emit state=print");
  setState('printing');

  if (!nspPrinterPrinter) return;

  nspPrinterPrinter.emit("temperatures", { 
    nozzle: {current:0, target:0, percentage:.25},
    nozzle2: {current:0, target:0, percentage:.25},
    bed: {current:0, target:0, percentage:.25}, 
    percentage:.5, heating:false
  });

// temperatures {nozzle: {current, target, percentage}, (nozzle2: {current, target, percentage},) bed: {current, target, percentage}, percentage, heating}

}

process.stdin.on('keypress', function (ch, key) {
  //console.log('got "keypress"', key);
  
  if (!key) return;

  if (key.name == 'p') {
    print();
  }
  if (key.name == 'q') {
    console.log("emit state=idle");
    setState('idle');
  }
  if (key.name == 'd') {
    // disconnect();
  }

  if (key.name == 'r') {
    // disconnect();
    // connect();
  }

  if (key.name == 's') {
    // setTimeout
    nspPrinterSlicer.emit("progress",{percentage:.5});
  }

  if (key.ctrl && key.name == 'c') {
    process.exit();
  }

  // if (key.name=='w') {
  //   toggleWebcam();
  // } 

  if (key.name == 'h') {
	  console.log("DummyPrinter help");
	  console.log("'p'		start printing");
	  console.log("'q'		stop printing");
	  console.log("'s'		increase slice progress by 0.5%");
	  console.log("'ctrl-c'	exit program");
  }

  // process.stdout.write(key);
});

// function toggleWebcam() {
//   if (nspPrinterWebcam) {
//     nspPrinterWebcam.removeAllListeners();
//     nspPrinterWebcam.disconnect();
//     delete nspPrinterWebcam; // = null;
//   } else {
    
//   }
// }

// function disconnect() {
//   console.log("disconnect");
//   nspPrinterRoot.disconnect();
//   nspPrinterPrinter.disconnect();
//   // nspPrinterWebcam.disconnect();
//   nspPrinterSlicer.disconnect();
// }

function connect() {
  console.log("connect");

  printer.connectTo("/"+printerID,printerKey,{forceNew:true},function(err,nsp) {
    if(err) throw new Error(err);
    nspPrinterRoot = nsp;

    console.log("fake /"+printerID + " emit printerState & clientSSID");

    // nsp.emit("printerState", {state: "idle"});
    setState('idle');
    nsp.emit("wifiSSID",{ssid:"Vechtclub XL F1.19"});
  });  

  printer.connectTo("/"+printerID+"-printer",printerKey,{forceNew:true},function(err,nsp) {
    if (err) throw new Error(err);
    // if (!nsp) throw new Error("Error /"+printerID+"-printer namespace is not ready");

    nspPrinterPrinter = nsp;

    nsp.on("print",function(data,cb,stream) {
      console.log("onPrint",data);
      setState('printing');
      if (cb) cb(null,"ok");
    });

    nsp.on("stop",function(data,cb,stream) {
      console.log("onStop",data);
      if (cb) cb(null,"ok");
      setState('idle');
    });
  });

  printer.connectTo("/"+printerID+"-slicer",printerKey,{forceNew:true},function(err,nsp) {
    if (err) throw new Error(err);
    nspPrinterSlicer = nsp;
  });

  // printer.connectTo("/"+printerID+"-webcam",printerKey,{forceNew:true},function(err,nsp) {
  //   if (err) throw new Error(err);
  //   nspPrinterWebcam = nsp;
  // });

  // connectWebcam();
}

function connectWebcam() {
  printer.connectTo("/"+printerID+"-webcam",printerKey,{forceNew:true},function(err,nsp) {
    if (err) throw new Error(err);
    takeSnapshot();
    
    function takeSnapshot() {
      console.log('tick cam');
      // var snapshot = spawn('imagesnap', ['-', '-w', '1'])
      var convert = spawn('convert', ['-', '-quality', '80', '-resize', '640x360', 'JPEG:-']);
      var stream = ss.createStream();
      ss(nsp).emit('image', stream); 
      // snapshot.stdout.pipe(convert.stdin);
      fs.createReadStream('webcam.jpg').pipe(convert.stdin);
      convert.stdout.pipe(stream);
      convert.stdout.on("end",function() {
        console.log("convert end");
        setTimeout(takeSnapshot,1000);
      });
    }
  });
}


// setInterval(function() {  
//   // console.log('webcam disabled');

//   return;

//   if (!nspPrinterWebcam || !nspPrinterWebcam.connected) {
//     // console.log('no connection yet')
//     return;
//   }

//   console.log('tick cam');
//   // var snapshot = spawn('imagesnap', ['-', 'w', '1'])
//   // var convert = spawn('convert', ['-', '-quality', '10', 'JPEG:-'])
//   var stream = ss.createStream();

//   ss(nspPrinterWebcam).emit('image', stream); //// why in the HostModule repo: 'image', {}, stream ????
//     // snapshot.stdout.pipe(convert.stdin);

//   fs.createReadStream('snapshot.jpg').pipe(stream);

// },5000);

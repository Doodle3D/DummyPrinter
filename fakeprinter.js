var keypress = require('keypress');
// var stdin = process.openStdin(); 
// require('tty').setRawMode(true); 
// process.stdin.setRawMode();

var debug = require('debug')('fakeprinter');

var PORT = process.env.PORT ? process.env.PORT : 5000;

var CLOUD_URL = "http://cloud.doodle3d.com:"+PORT;
var printer = require("./mock/printer")(CLOUD_URL);
var printerID;
var printerKey;
var nspPrinterRoot;
var nspPrinterPrinter;

var printerKey = '543bc6638b6a35696f459cdcdS0kgkKzSg2IehJke9uM';
var printerID = '543bc6638b6a35696f459cdc';

// printer.register(function(err,printerKey,printerID) {
//   console.log(err,printerKey,printerID);
//   process.exit();
// });


// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);
  
process.stdin.on('keypress', function (ch, key) {
  //console.log('got "keypress"', key);
  
  if (!key) return;

  if (key.name == 'p') {
    console.log("emit state=print");
    nspPrinterRoot.emit("printerState", {state: "printing"});
    nspPrinterPrinter.emit("state", {state: "printing"});
  }
  if (key.name == 'q') {
    console.log("emit state=idle");
    nspPrinterRoot.emit("printerState", {state: "idle"});
    nspPrinterPrinter.emit("state", {state: "idle"});
  }

  if (key.ctrl && key.name == 'c') {
    process.exit();
  }

  // process.stdout.write(key);
});

process.stdin.setRawMode(true);
process.stdin.resume();


printer.connectTo("/"+printerID,printerKey,{forceNew:true},function(err,nsp) {
  if(err) throw new Error(err);
  nspPrinterRoot = nsp;

  console.log("fake /"+printerID + " emit printerState & clientSSID");

  nsp.emit("printerState", {state: "idle"});
  nsp.emit("clientSSID",{ssid:"Vechtclub XL F1.19"});
  

});  

// printer.connectTo("/"+printerID+"-printer",printerKey,{forceNew:true},function(err,nsp) {
//   if(err) throw new Error(err);
//   nspPrinterPrinter = nsp;

//   /// FIXME
//   // nsp.emit("state", {state: "idle"});
//   // nsp.emit("clientSSID",{ssid:"Vechtclub XL F1.19"});
//   // nsp.on("print",function(data,callback) {
//   //   console.log("onPrint")
//   // });
// });

printer = new Printer("Ultimaker-test01");

loadSettings(printer); //reads from localStorage using printer.name

if (!printer.id || !printer.key) {
  printer.register(function(data) {
    console.log('register cb',printer)
    saveSettings(printer);
    init();
  });
} else {
  init();
}

function init() {
  printer.connect("/"+printer.id,function(err,printerRootSocket) {
    console.log('connected',err,printerRootSocket)
  });
}

function loadSettings(printer) {
  var settings = JSON.parse(localStorage.getItem(printer.name)) || undefined;
  
  //decorate printer object with values from settings object
  for (var i in settings) {
    printer[i] = settings[i];
  }
}

function saveSettings(printer) {
  localStorage.setItem(printer.name,JSON.stringify(printer));
}

function removeSettings(printer) {
  localStorage.removeItem(printer.name);
}
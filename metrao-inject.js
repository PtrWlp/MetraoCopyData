
function copyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.style.position = 'fixed';
  textArea.style.top = 0;
  textArea.style.left = 0;
  textArea.style.width = '2em';
  textArea.style.height = '2em';
  textArea.style.padding = 0;
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';
  textArea.style.background = 'transparent';
  textArea.value = text;
  document.body.appendChild(textArea);

  setTimeout(function(){ 
    try {
      textArea.focus();
      textArea.select();
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Copying text command was ' + msg);
    } catch (err) {
      console.log('Oops, unable to copy');
    }
  
    document.body.removeChild(textArea);
  }, 300);

}

function dataFromScript(scriptText) {
  // get rid of formatting, two spaces become 1
  scriptText = scriptText.replace(/  /g, ' ');
  const begintag = '$.plot("#placeholder", ';
  const startOfArray = scriptText.indexOf(begintag) + begintag.length;
  const endOfArray = scriptText.indexOf('xaxis: {');
  const arrayOfData = scriptText.substring(startOfArray, endOfArray - 10);

  // Repair the json errors
  var raw = arrayOfData.replace(/data: d(\d) =/g, '"data":').replace(/data: d(\d\d) =/g, '"data":');
  function fixkeys(input) {
      var result = input.replace(/label:/g, '"label":');
      result = result.replace(/color:/g, '"a":'); // not important
      result = result.replace(/lines:/g, '"b":');
      result = result.replace(/show:/g, '"c":');
      result = result.replace(/lineWidth:/g, '"d":');
      result = result.replace(/shadowSize:/g, '"e":');
      
      // Metrao adds a superflouus comma at the end.. sadly.
      result = result.replace(/,(?=[^,]*$)/, '');
      return result;
  }

  var inputData = JSON.parse(fixkeys(raw));

  function time_format(d) {
      function format_two_digits(n) { return n < 10 ? '0' + n : n;}
      return format_two_digits(d.getHours()) + ":" + format_two_digits(d.getMinutes());
  }

  var measurements = {};
  var streamlabels = [];

  inputData = inputData.sort(function(a,b) {return (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0);} ); 

  // Obtain unique timestamps
  inputData.forEach(stream => {
      streamlabels.push(stream.label);
      stream.data.forEach(measure => {
          // correct for utc
          var time = time_format(new Date(measure[0] - 1000*3600*2));
          if (measurements[time]) {
              measurements[time].push(measure[1]);
          } else {
              measurements[time] = [measure[1]];
          }
      })
  });

  // Write headers
  var result = 'time,' + streamlabels.join(',')+ '\n';
  // Write data
  Object.keys(measurements).forEach(time => {
      result = result + time + ',' + measurements[time].join(',') + '\n';
  });

  return result;
}

var projectName = "";
var allCol12 = document.getElementsByClassName("col_12");
for (let index = 0; index < allCol12.length; index++) {
  var text = allCol12[index].childNodes[0].nodeValue;
  if (text && text.indexOf('project: ') > -1) {
    projectName = text.replace(/,/g , ".");
    var posOfText = projectName.indexOf(' start:');
    var dateOfProject = projectName.substring(posOfText + 8, posOfText + 18);
    projectName = projectName.substring(0, posOfText).trim() + ' ' + dateOfProject;
  } 
}

var scriptsFound = document.getElementsByTagName("script");
var isCopied = false;
for (let index = 0; index < scriptsFound.length; index++) {
  const script = scriptsFound[index];
  const scriptText = script.innerHTML;
  if (scriptText.indexOf('$.plot("#placeholder",') > -1) {
    copyTextToClipboard(dataFromScript(scriptText));
    isCopied = true;
    break;
  } 
}

function selectBoxValue(id) {
  var box = document.getElementById(id);
  return box[box.selectedIndex].text;
}
var preset = selectBoxValue("userpresetnameid");
var template = selectBoxValue("presetnameid");

if (isCopied) {
  alert(projectName + "\n" + preset + "\n" +template + "\n" + 'Raw data copied to clipboard');
} else {
  alert('Couldn\'t find graph data on this page');
}



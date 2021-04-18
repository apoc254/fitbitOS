import clock from "clock";
import document from "document";
import userActivity from "user-activity";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import { Barometer } from "barometer";
import { battery } from "power";


//BAROMETER
// Fetch UI elements that need to display values
var altitudeLabel = document.getElementById("altitude");
var pressureLabel = document.getElementById("pressure");

// Initialize the UI with some values
altitudeLabel.text = "--";
pressureLabel.text = "--";

// Create a new instance of the Barometer
var bar = new Barometer();

// Update the lavel with each reading from the sensor
bar.onreading = () => {
  altitudeLabel.text = altitudeFromPressure(bar.pressure / 100) + " ft";
  pressureLabel.text = Math.round(bar.pressure / 100) + " hPa";
}

// Begin monitoring the sensor
bar.start();

// Converts pressure in millibars to altitude in feet
function altitudeFromPressure(pressure) {
  return Math.round((1 - (pressure/1013.25)**0.190284)*145366.45);
}


//STEPS - ELEVATION
import userActivity from "user-activity";

// Fetch UI elements that need to display values
let stepGoalField = document.getElementById('stepGoal');
let currentStepsField = document.getElementById('currentSteps');
let caloriesField = document.getElementById('calories');
let distanceField = document.getElementById('distance');
let floorsField = document.getElementById('floors');
let activeField = document.getElementById('active');

// Update the data on UI elements with each reading from the OS
function updateSteps() {
    currentStepsField.text = (userActivity.today.local.steps || 0)  + " /";
    caloriesField.text = userActivity.today.local.calories || 0;
    // converts meters to miles
    distanceField.text = (userActivity.today.adjusted.distance/1609) || 0;
    floorsField.text = userActivity.today.local.elevationGain || 0;
    activeField.text = userActivity.today.adjusted.activeZoneMinutes.total || 0;
    stepGoalField.text = (userActivity.goals.steps || 0) ;

    if  (userActivity.goals.steps !== 0) {
        let currentSteps = (userActivity.today.local.steps || 0) + " /";
        let stepPercentage = currentSteps / userActivity.goals.steps;

    }
}

//HEART RATE MONITOR
import { HeartRateSensor } from "heart-rate";
import { user } from "user-profile";

// Fetch UI elements that need to display values
var hrm = new HeartRateSensor();
let hrLabel = document.getElementById("hrm");
let hrLabelSh = document.getElementById("hrmShadow");
let hrLevel = document.getElementById("hrLevel");
let hrBar = document.getElementById("health_bar");
let hrmLastTimeStamp = 0;

// Fetch scale of HR using OS standards
hrLabel.text = "??";
let hrCustomZoneNames = {
    'out-of-range': 'Relaxed',
    'fat-burn': 'Fat Burn',
    'cardio': 'Cardio',
    'peak': 'Peak'
};

// Update the data on UI elements with each reading from the OS
hrm.onreading = function() {
    let heartRate = hrm.heartRate;
    let hrZone = user.heartRateZone(heartRate);

    hrLabel.text = heartRate;
    hrLabelSh.text = heartRate;
    hrLevel.text = hrCustomZoneNames[`${hrZone}`];
    hrBar.x = 39; //207

    hrm.stop();
};
// Error Handling
hrm.onerror = function() {
    hrLabel.text = '??';
};
// Check if the data is still updating
function hrmStillAlive() {
  if (hrmLastTimeStamp === hrm.timestamp) {
            hrLevel.text = "No Movement";
            hrBar.x = -168;
        } else {
            hrmLastTimeStamp = hrm.timestamp;
        }
}
// Begin HR program on the OS
hrm.start();

//BATTERY
// Fetch UI elements that need to display values
let batteryField = document.getElementById('battery');
let batteryFieldSh = document.getElementById('batteryShadow');
let batteryBar = document.getElementById('batBar');

batteryField.text = Math.floor(battery.chargeLevel);

//Update the data on UI elements with each reading from the OS
function updateBattery() {
    let batteryPercentage = Math.floor(battery.chargeLevel);

    batteryField.text = batteryPercentage;
    batteryFieldSh.text = batteryPercentage;

    if (batteryPercentage !== 0) {
        batteryBar.width = (batteryPercentage / 100) * 9;
        //batteryBar.x = 39 - (171 - ((batteryPercentage / 100) * 171));
    }
}
//Run battery function immediately
updateBattery();

//DISPLAY INTERVAL UPDATES
import { display } from "display";
//Call function at set amount of miliseconds
setInterval(intervalFunction, 2500);

//Function to call the above defined functions
function intervalFunction() {
    if (display.on) {
        hrm.start();
        updateSteps();
        updateBattery();
        bar.start();
        hrmStillAlive();
        updateDate()
    }
}
//Call functions when the display turns on or off immediately
display.onchange = function() {
    if (display.on) {
        hrm.start();
        updateSteps();
        updateBattery();
        updateDate()
        bar.start();
    } else {
        hrm.stop();
        bar.stop();
    }
}

//CLOCK - DATE
// Update the clock every minute
clock.granularity = "minutes";

// Get a handle on the clock element
const myLabel = document.getElementById("myLabel");
const myMonth = document.getElementById("date");
const dayofWeek = document.getElementById("dayOfWeek");

// Update the clock and date elements every tick with the current time from the OS
clock.ontick = (evt) => {
  let today = evt.date;
  let hours = today.getHours();
  let monthnum = today.getMonth();
  let day = today.getDate();
  let daycall = today.getDay();
// Labels for month values defined in the array below
  var month = new Array();
  month[0] = "January";
  month[1] = "February";
  month[2] = "March";
  month[3] = "April";
  month[4] = "May";
  month[5] = "June";  
  month[6] = "July";
  month[7] = "August";
  month[8] = "September";
  month[9] = "October";
  month[10] = "November";
  month[11] = "December";
// Labels for daye values defined in the array below
  var days = new Array();
  days[0] = "SUN";
  days[1] = "MON";
  days[2] = "TUE";
  days[3] = "WED";
  days[4] = "THU";
  days[5] = "FRI";
  days[6] = "SAT";
// Load the Array values from OS data
  let monthname = month[monthnum];
  let dayName = days[daycall];
// Verify clock chosen configuration
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = util.zeroPad(hours);
  }
  let mins = util.zeroPad(today.getMinutes());
   myLabel.text = `${hours}:${mins}`;
   myMonth.text = `${monthname} ${day}`;
   dayofWeek.text = `${dayName}`;
}




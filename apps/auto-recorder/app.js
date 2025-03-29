var last_steps = [];
var walking_timeout = null;
var recorder = require("recorder");
var is_recording = recorder.isRecording();
var last_recording = null;

function notify(msg) {
  Bangle.buzz();
  E.showMessage(msg, "Lopen");
}

function walking() {
  if (walking_timeout) {
    clearInterval(walking_timeout);
  }

  walking_timeout = setTimeout(stopWalking, 10000); // Set timeout for 10 seconds.

  if (!is_recording) {
    let mode = 'new';
    let twoMinutesAgo = (new Date()).getTime() - 120000;

    if (last_recording && last_recording > twoMinutesAgo) {
      mode = 'append';
    }

    recorder.setRecording(true, mode);
    is_recording = true;

    if (mode === 'append') {
      notify("Hervat recorder.");
    } else {
      notify("Start recorder.");
    }
  }
}

function stopWalking() {
  is_recording = recorder.isRecording();

  if (is_recording) {
    recorder.setRecording(false);
    is_recording = false;

    notify("Stop recorder.");
    last_recording = (new Date()).getTime();
  }
}

Bangle.on('step', (count) => {
  let time = (new Date()).getTime();

  // Create a step record with count and time
  let step = {
    count: count,
    time: time
  };
  last_steps.push(step);

  // Trim the last_steps array down to keep only the last 50 records
  if (last_steps.length > 50) {
    last_steps.shift();
  }

  // Filter steps from the last 30 seconds
  let thirtySecondsAgo = time - 30000;
  let recentSteps = last_steps.filter(s => s.time >= thirtySecondsAgo);

  // Sum the step counts from the recent steps
  let totalSteps = 0;
  if (recentSteps.length > 0) {
    totalSteps = recentSteps[recentSteps.length - 1].count - recentSteps[0].count;
  }

  E.showMessage(totalSteps + " stappen", "Lopen");

  // If the total steps in the last 30 seconds are greater than 30, trigger notify
  if (totalSteps > 30) {
    walking();
  }
});

E.showMessage("Lets go!", "Lopen");

const fs = require('fs');
const path = require('path');

const stateFile = path.join(__dirname, '../../state.json');

function getState() {
  if (!fs.existsSync(stateFile)) {
    return {
      timedIn: false,
      autoTimedIn: false,
      workLog: null,
      timeOutResponded: false,
    };
  }
  return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
}

function setState(updates) {
  const current = getState();
  const updated = { ...current, ...updates };
  fs.writeFileSync(stateFile, JSON.stringify(updated, null, 2));
}

function resetState() {
  fs.writeFileSync(stateFile, JSON.stringify({
    timedIn: false,
    autoTimedIn: false,
    workLog: null,
    timeOutResponded: false,
  }, null, 2));
}

module.exports = { getState, setState, resetState };
let state = {
  timedIn: false,
  autoTimedIn: false,
  workLog: null,
};

function getState() {
  return state;
}

function setState(updates) {
  state = { ...state, ...updates };
}

function resetState() {
  state = {
    timedIn: false,
    autoTimedIn: false,
    workLog: null,
  };
}

module.exports = { getState, setState, resetState };
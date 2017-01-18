'use strict';

new Vue({
  el: '#app',
  data: {
    audioContext: null,
    gainNode: null,
    osc: null,
    isPlaying: false,
    waveTable: null,
    pitch: 10,
    waveData: [0,0.1,.4,.4,1,.9,1,0.5,0.1,0.6,0.5,0.1,0.1,0,0.4,1,1,4,1,0.5],
  },
  created: onCreated,
  methods: {
    onPlayButton: function () {
      this.isPlaying ? stopSound(this) : playSound(this);
      this.isPlaying = !this.isPlaying;
    },
    onPitchChange: function(e) {
      this.osc.frequency.value = this.expoPitch;
    },
    onVolumeChange: function(e) {
      this.gainNode.gain.value = e.target.value;
    },
    onWaveDataChange: function(e) {
      // Convert textarea line delimited string back to array of numbers.
      var data = e.target.value.trim().split('\n');
      this.waveData = data;
      updateWaveData(this);
    },
  },
  computed: {
    // Pitch slider changes the pitch exponentially.
    expoPitch: {
      get: function() {
        return this.pitch * this.pitch;
      }
    },
    // User can edit each waveData number on a new line in the textarea.
    waveDataNewlineText: function() {
      return this.waveData.join('\n');
    },
  },
  filters: {
    numberCommas: function (str) {
      if (Intl && Intl.NumberFormat) {
        return new Intl.NumberFormat().format(str);
      }
      return str;
    }
  }
});

function onCreated() {
  this.audioContext = new AudioContext();
  this.gainNode = this.audioContext.createGain();
  this.gainNode.connect(this.audioContext.destination);
  this.osc = this.audioContext.createOscillator();
  updateWaveData(this);
}

function playSound(vm) {
  vm.osc.connect(vm.gainNode);
  if(!vm.osc._hasStarted){
    vm.osc.start(0);
    vm.osc._hasStarted = true;
  }
}

function stopSound(vm) {
  vm.osc.disconnect();
}

function updateWaveData(vm) {
  var real = new Float32Array(vm.waveData);
  var imag = new Float32Array(real.length);
  vm.waveTable = vm.audioContext.createPeriodicWave(real, imag);
  vm.osc.setPeriodicWave(vm.waveTable);
  vm.osc.frequency.value = 40;
  vm.osc._hasStarted = false;
}

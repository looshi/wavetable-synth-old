'use strict';

new Vue({
  el: '#app',
  data: {
    audioContext: null,
    osc: null,
    isPlaying: false,
    waveTable: null,
    pitch: 10,
  },
  created: onCreated,
  methods: {
    onPlayButton: function () {
      this.isPlaying ? stopSound(this) : playSound(this);
      this.isPlaying = !this.isPlaying;
    },
    onPitchChange: function(e) {

      this.osc.frequency.value = this.expoPitch;
    }
  },
  computed: {
    expoPitch: {
      get: function() {
        return this.pitch * this.pitch;
      }
    }
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
  this.osc = this.audioContext.createOscillator();
  var real = new Float32Array([0,0.1,.4,.4,1,.9,1,0.5,0.1,0.6,0.5,0.1,0.1,0,0.4,1,1,4,1,0.5,0.1,0.6,0.5,0.4,0.1]);
  var imag = new Float32Array(real.length);
  this.waveTable = this.audioContext.createPeriodicWave(real, imag);
  this.osc = this.audioContext.createOscillator();
  this.osc.setPeriodicWave(this.waveTable);
  this.osc.frequency.value = 40;
  this.osc._hasStarted = false;
}

function playSound(vm) {
  vm.osc.connect(vm.audioContext.destination);
  if(!vm.osc._hasStarted){
    vm.osc.start(0);
    vm.osc._hasStarted = true;
  }
}

function stopSound(vm) {
  vm.osc.disconnect();
}

'use strict';

const waveFiles = [
  'AKWF_R_asym_saw_05.wav',
  'AKWF_birds_0006.wav',
  'AKWF_bsaw_0005.wav',
  'AKWF_c604_0006.wav',
  'AKWF_cheeze_0001.wav',
  'AKWF_dbass_0002.wav',
  'AKWF_eorgan_0001.wav',
  'AKWF_fmsynth_0050.wav',
  'AKWF_granular_0001.wav',
  'AKWF_hvoice_0001.wav',
  'AKWF_oboe_0001.wav',
  'AKWF_oscchip_0001.wav',
  'AKWF_piano_0001.wav',
  'AKWF_snippet_0001.wav',
  'AKWF_stereo_0001.wav',
  'AKWF_symetric_0001.wav',
  'AKWF_tannerin_0001.wav',
  'AKWF_violin_0001.wav',
];

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
    waveFiles,
    masterPitch: 0,
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
  console.log('play', vm.osc, vm.osc._hasStarted);
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
}

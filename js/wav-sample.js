/*
wav-sample
loads a .wav file
loops it and pitches it up or down.
*/

Vue.component('wav-sample', {
  props: ['files', 'audioContext', 'pitch'],
  data: function() {
    return {
      on: false,
      file: this.files[0],
      id: Math.random(),
      wavSource: null,
      gainNode: null,
    };
  },
  methods: {
    toggleOn,  // These are bound to the Vue instance.
    onFileChange,
    onVolumeChange: function(e) {
      this.gainNode.gain.value = e.target.value;
    },
  },
  mounted: function() {
    // Load the first file.
    loadFile(this);
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
  },
  watch: {
    pitch: function (val) {
      this.wavSource.detune.value = val;
    }
  },
  template: `
    <div class='wave-sample'>
      <select v-on:change='onFileChange' v-model='file'>
        <option v-for='file in files'>{{ file }}</option>
      </select>
      <input type='checkbox' :id='id' v-model='on' v-on:change='toggleOn'>
      <label :for='id'>On</label>

      <input
        :id='id + "volume"'
        type='range'
        min='0'
        max='1'
        step='.01'
        v-on:input='onVolumeChange'/>
      <label :for='id + "volume"'>Volume</label>
    </div>
  `,
});

function toggleOn() {
  if (this.on) {
    this.wavSource.connect(this.gainNode);
  } else {
    this.wavSource.disconnect();
  }
}

function onFileChange(event) {
  loadFile(this);
}

function loadFile(vm) {
  // Can only stop after started, the first time this will throw an error.
  if (vm.wavSource && vm.wavSource._started) {
    vm.wavSource.stop();
  }

  vm.wavSource = vm.audioContext.createBufferSource();
  vm.wavSource.disconnect();

  axios.get(`/wavs/${vm.file}`, { responseType: 'arraybuffer' })
    .then(function (response) {

      vm.audioContext.decodeAudioData(response.data, function(buffer) {
        vm.wavSource.buffer = buffer;
        vm.wavSource.loop = true;
        vm.wavSource.detune.value = vm.pitch;
        vm.wavSource.start();
        vm.wavSource._started = true;
        if (vm.on) {
          vm.wavSource.connect(vm.gainNode);
        }
      }, function(e){'Error decoding audio data' + e.err});
    })
    .catch(function (error) {
      console.log('Error loading wav', error);
    });
}

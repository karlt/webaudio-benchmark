if (typeof(window) == "undefined") {
  benchmarks = []
  registerTestFile = function() {}
  registerTestCase = function(o) { return benchmarks.push(o.name); }
}

registerTestFile("think-mono-48000.wav");
registerTestFile("think-mono-44100.wav");
registerTestFile("think-mono-38000.wav");
registerTestFile("think-stereo-48000.wav");
registerTestFile("think-stereo-44100.wav");
registerTestFile("think-stereo-38000.wav");

registerTestCase({
  func: function () {
    var oac = new OfflineAudioContext(1, 120 * samplerate, samplerate);
    return oac;
  },
  name: "Empty testcase"
});

registerTestCase({
  func: function () {
    var oac = new OfflineAudioContext(1, 120 * samplerate, samplerate);
    var source0 = oac.createBufferSource();
    source0.buffer = getSpecificFile({rate: oac.samplerate, channels:1});
    source0.loop = true;
    source0.connect(oac.destination);
    source0.start(0);
    return oac;
  },
  name: "Simple gain test without resampling"
});

registerTestCase({
  func: function() {
    var oac = new OfflineAudioContext(2, 120 * samplerate, samplerate);
    var source0 = oac.createBufferSource();
    source0.buffer = getSpecificFile({rate: oac.samplerate, channels:2});
    source0.loop = true;
    source0.connect(oac.destination);
    source0.start(0);
    return oac;
  },
  name: "Simple gain test without resampling (Stereo)"
});

registerTestCase({
  func: function() {
    var oac = new OfflineAudioContext(1, 120 * samplerate, samplerate);
    var source0 = oac.createBufferSource();
    source0.buffer = getSpecificFile({rate: 38000, channels:1});
    source0.loop = true;
    source0.connect(oac.destination);
    source0.start(0);
    return oac;
  },
  name: "Simple gain test"
});

registerTestCase({
  func: function() {
    var oac = new OfflineAudioContext(2, 120 * samplerate, samplerate);
    var source0 = oac.createBufferSource();
    source0.buffer = getSpecificFile({rate: 38000, channels:2});
    source0.loop = true;
    source0.connect(oac.destination);
    source0.start(0);
    return oac;
  },
  name: "Simple gain test (Stereo)"
});

registerTestCase({
  func: function() {
    var oac = new OfflineAudioContext(2, 120 * samplerate, samplerate);
    var source0 = oac.createBufferSource();
    source0.buffer = getSpecificFile({rate: oac.samplerate, channels:1});
    source0.loop = true;
    source0.connect(oac.destination);
    source0.start(0);
    return oac;
  },
  name: "Upmix without resampling (Mono -> Stereo)"
});

registerTestCase({
  func: function() {
    var oac = new OfflineAudioContext(1, 120 * samplerate, samplerate);
    var source0 = oac.createBufferSource();
    source0.buffer = getSpecificFile({rate: oac.samplerate, channels:2});
    source0.loop = true;
    source0.connect(oac.destination);
    source0.start(0);
    return oac;
  },
  name: "Downmix without resampling (Mono -> Stereo)"
});

registerTestCase({
  func: function() {
    var oac = new OfflineAudioContext(2, 30 * samplerate, samplerate);
    for (var i = 0; i < 100; i++) {
      var source0 = oac.createBufferSource();
      source0.buffer = getSpecificFile({rate: 38000, channels:1});
      source0.loop = true;
      source0.connect(oac.destination);
      source0.start(0);
    }
    return oac;
  },
  name: "Simple mixing (same buffer)"
});

registerTestCase({
  func: function() {
    var oac = new OfflineAudioContext(2, 30 * samplerate, samplerate);
    var reference = getSpecificFile({rate: 38000, channels:1}).getChannelData(0);
    for (var i = 0; i < 100; i++) {
      var source0 = oac.createBufferSource();
      // copy the buffer into the a new one, so we know the implementation is not
      // sharing them.
      var b = oac.createBuffer(1, reference.length, 38000);
      var data = b.getChannelData(0);
      for (var j = 0; j < b.length; j++) {
        data[i] = reference[i];
      }
      source0.buffer = b;
      source0.loop = true;
      source0.connect(oac.destination);
      source0.start(0);
    }
    return oac;
  },
  name: "Simple mixing (different buffers)"
});

registerTestCase({
  func: function() {
    var oac = new OfflineAudioContext(1, 30 * samplerate, samplerate);
    var i,l;
    var decay = 10;
    var duration = 4;
    var len = samplerate * duration;
    var buffer = ac.createBuffer(2, len, oac.sampleRate)
    var iL = buffer.getChannelData(0)
    var iR = buffer.getChannelData(1)
    // Simple exp decay loop
    for(i=0,l=buffer.length;i<l;i++) {
      iL[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      iR[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    var convolver = oac.createConvolver();
    convolver.buffer = buffer;
    convolver.connect(oac.destination);

    var audiobuffer = getSpecificFile({rate: samplerate, channels:1});
    var source0 = oac.createBufferSource();
    source0.buffer = audiobuffer;
    source0.loop = true;
    source0.connect(convolver);
    source0.start(0);
    return oac;
  },
  name: "Convolution reverb"
});

registerTestCase({
  func: function() {
    var oac = new OfflineAudioContext(1, 30 * samplerate, samplerate);
    var duration = 30 * samplerate;
    var audiobuffer = getSpecificFile({rate: samplerate, channels:1});
    var offset = 0;
    while (offset < duration / samplerate) {
      var grain = oac.createBufferSource();
      var gain = oac.createGain();
      grain.connect(gain);
      gain.connect(oac.destination);
      grain.buffer = audiobuffer;
      // get a random 100-ish ms with enveloppes
      var start = offset * Math.random() * 0.5;
      var end = start + 0.005 * (0.999 * Math.random());
      grain.start(offset, start, end);
      gain.gain.setValueAtTime(offset, 0);
      gain.gain.linearRampToValueAtTime(.5, offset + 0.005);
      var startRelease = Math.max(offset + (end - start), 0);
      gain.gain.setValueAtTime(0.5, startRelease);
      gain.gain.linearRampToValueAtTime(0.0, startRelease + 0.05);

      // some overlap
      offset += 0.005;
    }
    return oac;
  },
  name: "Granular synthesis"
});



if (typeof(window) == "undefined") {
  exports.benchmarks = benchmarks;
}


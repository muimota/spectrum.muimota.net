var audioCtx = null;
var gainNode = null;

var buffers = null;
var sampleRate = null;
var playingSound = null;

function initAudio(){
  // create web audio api context
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  sampleRate = 22100;
  gainNode = audioCtx.createGain();
  gainNode.gain.value = 0.0;
  gainNode.connect(audioCtx.destination);

  //create buffers for each frequency
  var bufferFreqs = [808,1022,2044,2500];
  buffers = {};
  for (var i=0;i<bufferFreqs.length;i++) {
    var bufferFreq = bufferFreqs[i];
    buffers[bufferFreq] = new Array();
    for(var j = 0;j<1.0/bufferFreq * sampleRate;j++){
      var t = j/sampleRate;
      buffers[bufferFreq].push(Math.sign(Math.sin(2*Math.PI*t*bufferFreq)));
    }
  }

}

function audioBitarray(bitarray,lead){

  var frameCount = 0;
  var bitBuffers = [buffers['1022'],buffers['2044']];
  var leadFrames = 0;

  if (lead > 0) {
    leadFrames = lead * sampleRate
    frameCount += leadFrames; //add one second
  }

  for(var i=0;i<bitarray.length;i++){
    var bit = bitarray[i];
    frameCount += bitBuffers[bit].length;
  }

  myArrayBuffer = audioCtx.createBuffer(1, frameCount, sampleRate );
  var nowBuffering = myArrayBuffer.getChannelData(0);
  var bufferIndex = 0;
  var leadBuffer = buffers['808'];

  for(bufferIndex = 0;bufferIndex < leadFrames;bufferIndex++){
    nowBuffering[bufferIndex] = leadBuffer[bufferIndex % leadBuffer.length];
  }

  for(var i=0;i<bitarray.length;i++){
    var buffer = bitBuffers[bitarray[i]];
    for(var j=0;j<buffer.length;j++){
      nowBuffering[bufferIndex] = buffer[j];
      bufferIndex ++;
    }
  }

  var source = audioCtx.createBufferSource();
  source.buffer = myArrayBuffer;
  source.connect(gainNode);

  return source;
}

//creates an audio buffer based on string and lead time
function audioString(string,lead){

  var bitarray = [];


  for (var charIndex = 0;charIndex<string.length;charIndex++) {
    var charCode = string.charCodeAt(charIndex);

    for(var bitIndex=7;bitIndex>=0;bitIndex--){
        var bit = (charCode >> bitIndex) & 1;
        bitarray.push(bit);
    }
  }

  return audioBitarray(bitarray,lead)
}

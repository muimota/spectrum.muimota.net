var audioCtx = null;
var gainNode = null;

var buffers = null;
var sampleRate = null;
var playingSound = null;

var hightlightElem;
var prevbit ;

$(document).ready(function(){
  initAudio();

  ditherImages();
  initText($('.loadingText p'));
  var jqElem = $('.loadingText p');
  var delay = 0;
  var lead  = 1.0;
  for(var i=0;i<jqElem.length;i++){
    delay += sonify($(jqElem[i]),lead,delay);
  }
});

function sonify(jqElem,lead=1.2,delay=0) {
  var text = jqElem.text();
  var audioBufferNode = audioString(text,lead);
  var playLength = audioBufferNode.buffer.length / audioBufferNode.buffer.sampleRate;
  setTimeout(function(){
    audioBufferNode.start();
    showText(jqElem.children('span'),playLength-lead,lead);
  },delay*1000);
  return playLength;
}

function initAudio(){
  // create web audio api context
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  sampleRate = 22100;
  gainNode = audioCtx.createGain();
  gainNode.gain.value = 0.1;
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
//creates an audio buffer based on string and lead time
function audioString(string,leadTime = 0){

  var bits = [];
  var frameCount = 0;
  var bitBuffers = [buffers['1022'],buffers['2044']];
  var leadFrames = 0;

  for (var charIndex = 0;charIndex<string.length;charIndex++) {
    var charCode = string.charCodeAt(charIndex);

    for(var bitIndex=7;bitIndex>=0;bitIndex--){
        var bit = (charCode >> bitIndex) & 1;
        bits.push(bit);
        frameCount += bitBuffers[bit].length;
    }
  }


  if (leadTime > 0) {
    leadFrames = leadTime * sampleRate
    frameCount += leadFrames; //add one second
  }

  myArrayBuffer = audioCtx.createBuffer(1, frameCount, sampleRate );
  var nowBuffering = myArrayBuffer.getChannelData(0);
  var bufferIndex = 0;
  var leadBuffer = buffers['808'];

  for(bufferIndex = 0;bufferIndex < leadFrames;bufferIndex++){
    nowBuffering[bufferIndex] = leadBuffer[bufferIndex % leadBuffer.length];
  }

  for(var i=0;i<bits.length;i++){
    var buffer = bitBuffers[bits[i]];
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


//insert every word inside a span
function initText(domElement){

  domElement = $(domElement);

  if(domElement.size()>1){
    for(var i=0;i<domElement.size();i++){
      initText(domElement.get(i));
    }
    return
  }

  var text = domElement.text().trim();
  text = text.replace(/  +|\n/g, ' ');

  var words = text.split(' ');
  text = text.replace(/\s/g,'');
  var lastIndex = 0;
  $(domElement).empty();
  //puts every word in a span
  $.each(words, function(i, word) {
      var index = text.indexOf(word,lastIndex);
      lastIndex = index + word.length;
      var wordDom;
      if(word == '<br>'){
        wordDom = $('<br>');
      }else{
        wordDom = $('<span>').text(word).data('start',index).data('end',lastIndex).addClass('unloaded');
      }
      $(domElement).append(wordDom);
      $(domElement).append(' ');

  });
  domElement.data('text',text);
}



function showText(jqElem,time, delay){

  var time = time/jqElem.length*1000;

  //a local function to keep
  function showWord(word,prevWord,time){
    setTimeout( function() {
      word.removeClass().addClass('loading');
      prevWord.removeClass().addClass('loaded');
    },time); // delay 100 ms
  }

  setTimeout( function() {
    for(var i=0;i<jqElem.length+1;i++){
      var word = $(jqElem[i]);
      var prevWord = $(jqElem[i-1]);
      showWord(word,prevWord,i*time);
    }
  },delay*1000);

}

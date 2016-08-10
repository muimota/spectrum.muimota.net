var audioCtx = null;
var gainNode = null;
var sounds = null;
var playingSound = null;

var origHTML;
var hightlightElem;
var prevbit ;

$(document).ready(function(){
  initAudio();

  ditherImages();
  initText($('.loadingText p'));
  $('#soundButton').click(playTextArea);
});


function initAudio(){
  // create web audio api context
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  gainNode = audioCtx.createGain();
  gainNode.gain.value = 0.1;
  gainNode.connect(audioCtx.destination);

  // create Oscillator node
  var sound0 = audioCtx.createOscillator();

  sound0.type = 'square';
  sound0.frequency.value = 2044; // value in hertz
  sound0.start();

  var sound1 = audioCtx.createOscillator();

  sound1.type = 'square';
  sound1.frequency.value = 1022; // value in hertz
  sound1.start();

  sounds = {0:{sound:sound0,ms:1000.0/sound0.frequency.value},
            1:{sound:sound1,ms:1000.0/sound1.frequency.value}};

}

function playStartBlock(domElement){

  //leader block 2ms at 2500
  // leader tone
  var leader = audioCtx.createOscillator();

  leader.type = 'square';
  leader.frequency.value = 808; // value in hertz
  leader.start();
  leader.connect(gainNode);

  setTimeout(function(){

    leader.stop();
    leader.disconnect();
    //starting block 2ms at 2500
    var blockStart = audioCtx.createOscillator();

    blockStart.type = 'square';
    blockStart.frequency.value = 2500; // value in hertz
    blockStart.start();
    blockStart.connect(gainNode);

    setTimeout(function(){
      blockStart.stop();
      blockStart.disconnect();
      playText(domElement);
    },2);

  },1000);
}

function playText(domElement,charIndex,bitIndex){

  var currentElem = domElement.first();

  if(charIndex === undefined){
    charIndex = 0;
    currentElem.find('span').first().addClass('loading');
  }


  var string = currentElem.data('text');
  //http://stackoverflow.com/a/5409767/2205297
  bitIndex   = (bitIndex === undefined) ? 7 : bitIndex;

  var bit = (string.charCodeAt(charIndex) >> bitIndex) & 1;

  var timeout = sounds[bit].ms;

  //just disconnect if prev bit was different
  if(prevbit != bit){
    if(playingSound != null){
      playingSound.disconnect();
    }
    playingSound = sounds[bit].sound;
    playingSound.connect(gainNode);
  }
  prevbit = bit;

  bitIndex --;
  if(bitIndex < 0){
    bitIndex = 7;
    charIndex ++;

    //end text
    if(charIndex >= string.length){
      playingSound.disconnect();
      playingSound = null;
      currentElem.find('span').removeClass('loading').addClass('loaded');
      if(domElement.size()>1){
        playStartBlock(domElement.nextAll());
      }
      return;
    }

    currentElem.find('span').each(function(i){
      var self  = $(this);
      var start = self.data('start');
      var end   = self.data('end');

      //@todo:fix when charIndex == 0
      if(charIndex == start){
        self.prev().removeClass('loading').addClass('loaded');
        self.addClass('loading');
      }
    })
  }

  setTimeout(function(){playText(domElement,charIndex,bitIndex)},timeout);
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
        wordDom = $('<span>').text(word).data('start',index).data('end',lastIndex);
      }
      $(domElement).append(wordDom);
      $(domElement).append(' ');

  });
  domElement.data('text',text);
}

function playTextArea(){

  if(playingSound != null){
    return;
  }
  selector = '.loadingText p'
  domElement = $(selector);

  playStartBlock(domElement);

}

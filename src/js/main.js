var audioCtx = null;
var sounds = null;
var playingSound = null;

var origHTML;
var hightlightElem;
var prevbit ;

$(document).ready(function(){
  initAudio();

  ditherImages();
  initText($('#textArea'));
  $('#soundButton').click(playTextArea);
});


function initAudio(){
  // create web audio api context
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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

function playStartBlock(string){

  //leader block 2ms at 2500
  // leader tone
  var leader = audioCtx.createOscillator();

  leader.type = 'square';
  leader.frequency.value = 808; // value in hertz
  leader.start();
  leader.connect(audioCtx.destination);

  setTimeout(function(){

    leader.stop();
    leader.disconnect();
    //starting block 2ms at 2500
    var blockStart = audioCtx.createOscillator();

    blockStart.type = 'square';
    blockStart.frequency.value = 2500; // value in hertz
    blockStart.start();
    blockStart.connect(audioCtx.destination);

    setTimeout(function(){
      blockStart.stop();
      blockStart.disconnect();
      playString(string);
    },2);

  },1000);
}

function playString(string,charIndex,bitIndex){

  if(charIndex === undefined){
    charIndex = 0;
    $('#textArea span').first().addClass('highlight');
  }
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
    playingSound.connect(audioCtx.destination);
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
      $('#textArea span').removeClass('highlight');
      return;
    }

    $('#textArea span').each(function(i){
      var self  = $(this);
      var start = self.data('start');
      var end   = self.data('end');

      //@todo:fix when charIndex == 0
      if(charIndex == start){
        self.prev().removeClass('highlight');
        self.addClass('highlight');
      }
    })
  }

  setTimeout(function(){playString(string,charIndex,bitIndex)},timeout);
}

//insert every word inside a span
function initText(domElement){

  domElement = $(domElement);
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

}

function playTextArea(){

  if(playingSound != null){
    return;
  }
  var text = $('#textArea span').text()
  text.replace('\n','');
  playStartBlock(text);

}

var audioCtx = null;
var sounds = null;
var playingSound = null;

var origHTML  ;
$(document).ready(function(){
  initAudio();

  //http://stackoverflow.com/q/21257688/2205297
  $('[contenteditable]').on('paste',function(e) {
    e.preventDefault();
    var text = (e.originalEvent || e).clipboardData.getData('text/plain') || prompt('Paste something..');
    document.execCommand('insertText', false, text);
  });

  $('div[contenteditable]').keydown(function(e) {
    // trap the return key being pressed
    if (e.keyCode === 13) {
      // insert 2 br tags (if only one br tag is inserted the cursor won't go to the next line)
      document.execCommand('insertHTML', false, '<br>');
      // prevent the default behaviour of return key pressed
      return false;
    }
  });

  ditherImage();

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
  // leader tone
  var leader = audioCtx.createOscillator();

  leader.type = 'square';
  leader.frequency.value = 808; // value in hertz
  leader.start();
  leader.connect(audioCtx.destination);

  setTimeout(function(){

    leader.stop();
    leader.disconnect();

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

  },2000);
}

function playString(string,charIndex,bitIndex){

  charIndex  = charIndex  || 0;
  //http://stackoverflow.com/a/5409767/2205297
  bitIndex   = (bitIndex === undefined) ? 7 : bitIndex;

  if(playingSound != null){
    playingSound.disconnect();
  }



  var bit = (string.charCodeAt(charIndex) >> bitIndex) & 1;

  playingSound = sounds[bit].sound;
  var timeout = sounds[bit].ms;

  playingSound.connect(audioCtx.destination);

  bitIndex --;
  if(bitIndex < 0){
    bitIndex = 7;
    charIndex ++;

    if(charIndex >= string.length){
      playingSound.disconnect();
      playingSound = null;
      $('#textArea').html(origHTML);
      return;
    }

    if(string[charIndex] == ' ' || string[charIndex] == '<'){
      $('#textArea span').removeClass('highlight');
    }else{
      $('#textArea span').each(function(i){
        var self  = $(this);
        var start = self.data('start');
        var end   = self.data('end');
        if(charIndex >= start && charIndex <= end){
          self.addClass('highlight');
        }
      })
    }
  }

  setTimeout(function(){playString(string,charIndex,bitIndex)},timeout);
}

function initText(){

  var text = $('#textArea').html();
  //text = text.replace(/<br>/g,'\n');
  var words = text.replace(/  +/g, ' ').split(' ');
  var lastIndex = 0;
  $('#textArea').empty();

  $.each(words, function(i, word) {
      var index = text.indexOf(word,lastIndex);
      var whitespaces = new Array(index - lastIndex + 1).join(' ');
      lastIndex = index + word.length;
      $('#textArea').append(whitespaces);
      var wordDom;
      if(word == '<br>'){
        wordDom = $('<br>');
      }else{
        wordDom = $('<span>').text(word).data('start',index).data('end',lastIndex);
      }
      $('#textArea').append(wordDom);
  });

}

function playTextArea(){

  origHTML = $('#textArea').html();
  initText();

  if(playingSound == null){
    playStartBlock(origHTML);
  }
  //remove all spans
  //$('#textArea').html(text);
}

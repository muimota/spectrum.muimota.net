var sounds = null;
var playingSound = null;
function init(){
  var sound0 = new Pizzicato.Sound({
                      source: 'wave',
                      options: {
                          type: 'square',
                          frequency: 2044
                      }
                  });

  var sound1 = new Pizzicato.Sound({
                      source: 'wave',
                      options: {
                          type: 'square',
                          frequency: 1022
                      }
                  });

  sounds = {0:{sound:sound0,ms:0.489},1:{sound:sound1,ms:0.978}};
}


function playString(string,charIndex,bitIndex){

  charIndex  = charIndex  || 0;
  bitIndex   = bitIndex   || 0;


  if(playingSound){
    playingSound.stop();
  }

  if(charIndex >= string.length){
    playingSound.stop();
    playingSound = null;
    return;
  }

  var bit = (string.charCodeAt(charIndex) >> bitIndex) & 1;

  playingSound = sounds[bit].sound;
  var timeout = sounds[bit].ms;
  playingSound.play();
  bitIndex ++;
  if(bitIndex == 8){
    bitIndex = 0;
    charIndex++;
  }
  setTimeout(function(){playString(string,charIndex,bitIndex)},timeout);
}

function playTextArea(){
  var text = document.getElementById("textArea").value;
  if(playingSound == null){
    playString(text);
  }
}


$(document).ready(init);

var soundActive;

function init(){


  initAudio(22500,.3);
  initText($('p'));
  var soundCookie = Cookies.get('soundActive')
  soundActive = soundCookie == undefined ||  soundCookie == 'true';
  setSound(soundActive);
  var jqElem = $('p');
  var lead  = 1.2;

  ditherImages(undefined,function(){setTimeout(function(){sonify(jqElem,lead);},500)});

  $('a.soundbtn').click(function(){
      setSound(!soundActive);
      return false;
    }
  )
}

function setSound(_soundActive){
  soundActive = _soundActive;
  activateSound(soundActive);
  Cookies.set('soundActive', soundActive);
  var jqElem = $('nav a.soundbtn');
  if(soundActive){
    jqElem.text("SOUND:ON")
    jqElem.removeClass('soundOff').addClass('soundOn');
  }else{
    jqElem.text("SOUND:OFF")
    jqElem.removeClass('soundOn').addClass('soundOff');
  }
}

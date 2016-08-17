
$(document).ready(function(){

  initAudio();
  ditherImages();
  initText($('.loadingText p'));

  var jqElem = $('.loadingText p');
  var delay = 0.2;
  var lead  = 1.2;

  sonify(jqElem,lead);

});

function sonify(jqElem,lead) {

  var nextElem = null;
  if(jqElem.length>1){
    var auxElem = jqElem[0];
    nextElem = jqElem.nextAll();
    jqElem = $(auxElem);
  }
  var text = jqElem.text();
  var audioBufferNode = audioString(text,lead);
  var playLength = audioBufferNode.buffer.length / audioBufferNode.buffer.sampleRate;

  audioBufferNode.start();
  showText(jqElem.children('span'),playLength-lead,lead);

  if(nextElem != null){
    setTimeout(function(){
        sonify(nextElem,0)
    },playLength*1000);
  }
  return playLength;

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

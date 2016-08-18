
window.onload = function(){

  initAudio();

  initText($('p'));
  var jqElem = $('p');
  var lead  = 1.2;

  ditherImages(undefined,function(){sonify(jqElem,lead);});
};

function sonify(jqElem,lead) {

  var nextElem = null;
  if(jqElem.length>1){
    var auxElem = jqElem[0];
    nextElem = jqElem.slice(1);
    jqElem = $(auxElem);
  }
  var text = jqElem.text();

  var audioBufferNode = audioString(text,lead);
  var playLength = audioBufferNode.buffer.length / audioBufferNode.buffer.sampleRate;

  audioBufferNode.start();

  showText(jqElem.children('.unloaded'),playLength-lead,lead);

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

  if(domElement.length>1){
    for(var i=0;i<domElement.length;i++){
      initText(domElement[i]);
    }
    return
  }

  var elements = domElement.contents().each(
    function(i){
      if(this.nodeType == 3){
        var self = $(this);
        var text = self.text().trim().replace(/  +|\n/g, ' ');
        var words = text.split(' ');
        $.each(words, function(i, word) {
            var wordDom;
            wordDom = $('<span>').text(word).addClass('unloaded');
            self.before(wordDom);
            self.before(' ');
        });
        self.remove();
      }else{
        $(this).addClass('unloaded');
        $(this).after(' ');
      }
    });
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

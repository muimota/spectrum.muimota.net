//http://stackoverflow.com/a/12423733/2205297
function ditherImages(selector){

  if(selector == undefined){
    selector = 'img';
  }

  $(selector).each(function(index,domElement){ditherImage(domElement);});
}

function ditherImage(domElement){

  var canvas = document.createElement('canvas');
  var ctx    = canvas.getContext('2d');
  var img    = $(domElement);

  if(!img.is('img')){
    console.log('not image');
    return;
  }
  img.attr("src", img.attr("src"))
  //when loaded, not before
  img.load( function() {

    var resolution = 2;

    canvas.width  = this.clientWidth / resolution ;
    canvas.height = this.clientHeight/ resolution ;
    ctx.drawImage( this, 0, 0, canvas.width, canvas.height );

    var imageData  = ctx.getImageData( 0, 0, canvas.width, canvas.height);
    // Matrix
    var threshold_map_4x4 = [
        [  1,  9,  3, 11 ],
        [ 13,  5, 15,  7 ],
        [  4, 12,  2, 10 ],
        [ 16,  8, 14,  6 ]
    ];

    // imageData
    var width  = imageData.width;
    var height = imageData.height;
    var pixel  = imageData.data;
    var x, y, a, b, gray;

    //quantize value to
    function quantize(val){

      if(val<155){
        return 0;
      }else {
        return 0xCD;
      }
    }
    // filter

    for ( x=0; x<width; x++ )
    {
        for ( y=0; y<height; y++ )
        {
            a    = ( x * height + y ) * 4;
            b    = threshold_map_4x4[ x%4 ][ y%4 ];

            imageData.data[ a + 0 ] = quantize(imageData.data[ a + 0 ] + b);
            imageData.data[ a + 1 ] = quantize(imageData.data[ a + 1 ] + b);
            imageData.data[ a + 2 ] = quantize(imageData.data[ a + 2 ] + b);

        }
    }
    //sonify just the black pizels as 0, 8 pixels = byte
    //skip groups of 8 white pixels

    var bitarray = [];
    var chunksize = 8;
    var chunk = new Array();
    var sonifiedPixels = 0;
    var channelsCount = 3; //we use just one channel

    for(var i=0;i<chunksize*channelsCount;i++){
      chunk.push(0);
    }
    //evaluate how many chunk will be ignored
    for(var i=0;i<imageData.data.length/4;i+=chunksize){
      var ignoreChunk = true;
      for(var j=0;j<chunksize;j++){
        for(var channel=0;channel<channelsCount;channel++){
          var data = imageData.data[( i + j)*4+channel];
          ignoreChunk = ignoreChunk && data == 0xCD; //ignore while pixels in chunk are white
          chunk[j+channel] = (data == 0xCD) ? 1:0;
        }
      }
      if(ignoreChunk == false){
        bitarray = bitarray.concat(chunk);
        sonifiedPixels += chunksize;
      }else{
        console.log('ignoreChunk');
      }
    }

    console.log('sonified pixels'+sonifiedPixels)
    var lead = 1.0;
    var audioBufferNode = audioBitarray(bitarray,lead);
    var playLength = audioBufferNode.buffer.duration-lead;
    var delay = playLength / (sonifiedPixels / chunksize) * 1000;



    ctx.putImageData( imageData, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //css scale up
    canvas.style.width  = img.css('width');
    canvas.style.height = img.css('height');
    img.replaceWith(canvas);

    var pixelData = ctx.createImageData(chunksize,1); // only do this once per page
    var pixelOffset = 0;
    var drawPixels = 0;

    audioBufferNode.start();
    var startTime = audioCtx.currentTime;
    setTimeout(putPixel,lead*1000);

    function putPixel(){

      //ignore white pixels from the front
      var ignoreChunk = true;

      while(ignoreChunk && pixelOffset<imageData.data.length/4){

        for(var i=0;i<chunksize && ignoreChunk;i++){
          //just check rgb
          for(var channel=0;channel<3 && ignoreChunk;channel++){
            var data = imageData.data[(pixelOffset+i) * 4 + channel]
            ignoreChunk = (data == 0xCD); //if there is something not white
                                          //dont ignore the chunk
          }
        }

        if(ignoreChunk){
          console.log('ignoreChunk');
          pixelOffset += chunksize;
        }
      }

      //pixelOffset = pixelOffset - pixelOffset % pixelData.width;

      if(pixelOffset<imageData.data.length/4){

          var x = pixelOffset%imageData.width;
          var y =  Math.floor(pixelOffset/imageData.width);

          for(var i=0;i<pixelData.width;i++){
            //copy channels
            for(var channel=0;channel<4;channel++){
              pixelData.data[i * 4 + channel] = imageData.data[(pixelOffset + i) * 4 + channel];
            }
          }

          ctx.putImageData( pixelData,x,y );
          drawPixels+=8;

          //check if chunk is out the canvas
          if( x + pixelData.width > imageData.width){

            var outPixels = x + pixelData.width - imageData.width;
            for(var i=0;i<outPixels;i++){
              //copy channels
              for(var channel=0;channel<4;channel++){
                pixelData.data[i * 4 + channel] = imageData.data[(pixelOffset + chunksize - i) * 4 + channel];
              }
            }
            ctx.putImageData( pixelData,0,y+1 );
          }

          pixelOffset += pixelData.width;
          var currentTime = audioCtx.currentTime - startTime;

          setTimeout(putPixel,1);
      }else{
        audioBufferNode.stop();
        console.log('drawnPixels: '+drawPixels);
      }

    }

  });

}

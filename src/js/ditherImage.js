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

            pixel[ a + 0 ] = quantize(pixel[ a + 0 ] + b);
            pixel[ a + 1 ] = quantize(pixel[ a + 1 ] + b);
            pixel[ a + 2 ] = quantize(pixel[ a + 2 ] + b);

        }
    }
    //sonify just the black pizels as 0, 8 pixels = byte
    //skip groups of 8 white pixels

    var bitarray = [];
    var chunksize = 8;
    var chunk = new Array();

    for(var i=0;i<chunksize;i++){
      chunk.push(0);
    }

    for(var i=0;i<pixel.length;i+=chunksize*4){
      var ignoreChunk = false;
      for(var j=0;j<chunksize;j++){
        var whitePixel = pixel[i] == 0xCD && pixel[i+1] == 0xCD && pixel[i+2] == 0xCD;
        ignoreChunk = ignoreChunk && whitePixel; //ignore while pixels in chunk are white
        chunk[j] = whitePixel ? 1:0;
      }
      if(!ignoreChunk){
        bitarray = bitarray.concat(chunk);
      }
    }

    audioBitarray(bitarray,0).start();

    ctx.putImageData( imageData, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //css scale up
    canvas.style.width  = img.css('width');
    canvas.style.height = img.css('height');
    img.replaceWith(canvas);

    var pixelData = ctx.createImageData(8,1); // only do this once per page
    var pixelOffset = 0;

     putPixel();

    function putPixel(){
      var ignorePixel = true;
      //ignore white pixels from the front
      while(ignorePixel && pixelOffset<imageData.data.length){
        //just check rgb
        for(var channel=0;ignorePixel && channel<3;channel++){
          var data = imageData.data[pixelOffset * 4 + channel]
          ignorePixel = data == 0xCD
        }
        if(ignorePixel){
          pixelOffset ++;
        }
      }
      pixelOffset = pixelOffset - pixelOffset % pixelData.width;
      if(pixelOffset<imageData.data.length){
          var x = pixelOffset%imageData.width;
          var y =  Math.floor(pixelOffset/imageData.width);
          for(var i=0;i<pixelData.width;i++){
            //copy channels
            for(var channel=0;channel<4;channel++){
              pixelData.data[i * 4 + channel] = imageData.data[pixelOffset*4 + i*4 + channel];
            }
          }
          ctx.putImageData( pixelData,x,y );

          //check
          if( x + pixelData.width > imageData.width){
            pixelOffset += imageData.width - x;
          }else{
            pixelOffset += pixelData.width;
          }

          setTimeout(putPixel,10);
      }
    }

  });

}

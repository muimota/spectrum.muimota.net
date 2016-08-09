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
  //when loaded
  img.load( function() {

    var resolution = 3;

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

    ctx.putImageData( imageData, 0, 0);
    //css scale up
    canvas.style.width  = img.css('width');
    canvas.style.height = img.css('hright');
    img.replaceWith(canvas);
  });

}

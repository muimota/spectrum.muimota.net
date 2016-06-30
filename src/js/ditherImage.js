//http://stackoverflow.com/a/12423733/2205297
function ditherImage(){

  var canvas = document.createElement('canvas');
  var ctx    = canvas.getContext('2d');
  var img    = new Image();

  img.src    = 'img/paris.jpg';
  img.onload = function() {

    var depth      = 128;
    var resolution = 3;

    canvas.width  = this.width / resolution ;
    canvas.height = this.height/ resolution ;
    ctx.drawImage( this, 0, 0, this.width / resolution, this.height / resolution );

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
            //grayscale
            gray = (pixel[ a + 0 ] + pixel[ a + 1 ] + pixel[ a + 2 ]) / 3 ;
            gray = ( (gray + b) / depth | 0 ) * depth;
            pixel[ a + 0 ] = quantize(pixel[ a + 0 ] + b);
            pixel[ a + 1 ] = quantize(pixel[ a + 1 ] + b );
            pixel[ a + 2 ] = quantize(pixel[ a + 2 ] + b);

            //pixel[ a + 3 ] = ( (pixel[ a + 3 ]+ b) / depth | 3 ) * depth;
        }
    }

    ctx.putImageData( imageData, 0, 0);
    canvas.style.width  = this.width;
    canvas.style.height = this.height;

  };
  //canvas.style.width = 600;
  document.body.appendChild(canvas);
}

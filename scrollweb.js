// --------------------------
// Inital Vars / Wall
// --------------------------

// Initialize IScoll for wall
var wallScroll = new IScroll('#wallScrollerWrap', {
  probeType: 3, // 1-3, 3 being the most accurate option (required for certain features) but also the most resource demanding option
  zoom: false,
  zoomMax: 1,
  scrollX: true,
  scrollY: false,
  mouseWheel: true,
  deceleration: 0.005
});

// canvas
var c = $('#wall');
// get canvas context so we can draw on it later
var ctx = c[0].getContext('2d');
// image(s) we will be drawing...
var wall_image_urls = [
	'http://patterninteractive.com/heritage-wall/images/sections-1024/section_01.jpg',
	'http://patterninteractive.com/heritage-wall/images/sections-1024/section_02.jpg',
	'http://patterninteractive.com/heritage-wall/images/sections-1024/section_03.jpg',
	'http://patterninteractive.com/heritage-wall/images/sections-1024/section_04.jpg',
	'http://patterninteractive.com/heritage-wall/images/sections-1024/section_05.jpg',
	'http://patterninteractive.com/heritage-wall/images/sections-1024/section_06.jpg',
	'http://patterninteractive.com/heritage-wall/images/sections-1024/section_07.jpg',
	'http://patterninteractive.com/heritage-wall/images/sections-1024/section_08.jpg',
	'http://patterninteractive.com/heritage-wall/images/sections-1024/section_09.jpg',
	'http://patterninteractive.com/heritage-wall/images/sections-1024/section_10.jpg',
	'http://patterninteractive.com/heritage-wall/images/sections-1024/section_11.jpg',
	'http://patterninteractive.com/heritage-wall/images/sections-1024/section_12.jpg',
	'http://patterninteractive.com/heritage-wall/images/sections-1024/section_13.jpg',
	'http://patterninteractive.com/heritage-wall/images/sections-1024/section_14.jpg',
	'http://patterninteractive.com/heritage-wall/images/sections-1024/section_15.jpg',
	'http://patterninteractive.com/heritage-wall/images/sections-1024/section_16.jpg',
	'http://patterninteractive.com/heritage-wall/images/sections-1024/section_17.jpg',
	'http://patterninteractive.com/heritage-wall/images/sections-1024/section_18.jpg',
	'http://patterninteractive.com/heritage-wall/images/sections-1024/section_19.jpg',
	'http://patterninteractive.com/heritage-wall/images/sections-1024/section_20.jpg'
];
var image_ready = false;

function resize_canvas() {
  var winWidth = $(window).outerWidth(true);
  var winHeight = $(window).outerHeight(true);
  c[0].width = winWidth;
  c[0].height = winHeight;

  // reset image starting positions
  if( image_ready && wall_images.length > 0 ) {
    wallScrollerWidth = 0;
    for(i=0; i < wall_images.length-1; i++){
      imgWidth = wall_images[i].imgWidth;
      imgHeight = wall_images[i].imgHeight;

      // since the images drawn will be scaled to fit the device we need take that into account
      var img_posX_start_ratio = c[0].height / imgHeight;
      img_posX_start = imgWidth * img_posX_start_ratio;

      // current with of the wall which is also the starting position for the next image
      wallScrollerWidth += img_posX_start;
      wall_images[i].sx = wallScrollerWidth;
    }
  }

  // set width of iScoll overlay
  document.getElementById('wallScroller').style.width = wallScrollerWidth+'px';
  // refresh iScroll so it knows the changes
  wallScroll.refresh();
  wallScroll.scrollTo(0);
}

// immediately resize canvas
resize_canvas();

// resize canvas again if window is resized
var debounce_resize;
$(window).on('resize orientationchange', function(){
  // The timeout acts as a debounce as well has a timeout for mobile devices as they take about 2-300 ms to complete an orientationchange
  clearTimeout(debounce_resize);
  debounce_resize = setTimeout(function(){
    resize_canvas();

    // we have to now redraw the canvas or what is on it may be stretched
    if( image_ready ) { // lets make sure the images have been loaded
      draw(0);
    }

  }, 300);
});

// --------------------------
// load a wall images
// --------------------------

var img_counter = 0;
var wallScrollerWidth = 0;
var wall_images = [];
function load_wall_imgs(img_counter){
  var wall_image_data;
  wall_image = new Image();

   // make sure you add the onload event before the src or the image may load be fire this func is defined
  wall_image.onload = function(){

    imgWidth = this.width;
    imgHeight = this.height;

    // since the images drawn will be scaled to fit the device we need take that into account
    var img_posX_start_ratio = c[0].height / imgHeight;
        img_posX_start = imgWidth * img_posX_start_ratio;

    // current with of the wall which is also the starting position for the next image
    wallScrollerWidth += img_posX_start;

    // store image obj in array
    wall_img_obj = {
        img: this, // image obj to be drawn by canvas
        imgWidth: imgWidth,
        imgHeight: imgHeight,
        sx: wallScrollerWidth // px position along the wall (imagining it is one wall with imgs side by side)
    }
    wall_images.push(wall_img_obj);

    if( img_counter < wall_image_urls.length-1 ) {
      img_counter++; // increment to next image
      load_wall_imgs(img_counter);
    } else {
      // flag use in resize function to make sure it doesn't try to draw images before they are ready
      image_ready = true;

      document.getElementById('wall').style.width = window.width+'px';
      // set width of iScoll overlay
      document.getElementById('wallScroller').style.width = wallScrollerWidth+'px';
      // refresh iScroll so it knows the changes
      wallScroll.refresh();
      // draw the image
      draw(0);
      // added scroll event
      wallScroll.on('scroll', function(){
        draw(this.x);
      });
    }

  }
  wall_image.src = wall_image_urls[img_counter];

}
load_wall_imgs(0);

// function draw the image
function draw(x) {

  // clear canvas
  ctx.clearRect(0, 0, c[0].width, c[0].height);

  // end position of the canvas
  var canvasEnd = c[0].width;

  // loop through our images
  for (var i = 0; i < wall_images.length; i++) {

   var img_posX_start;
   // if its not the first image on the wall add the width of the previous image to is position so they don't overlap
   if( i > 0 ) {
     img_posX_start = wall_images[i-1].sx + x;
   } else {
     img_posX_start = x;
   }

   // use the ratio of the image to wall to know the starting postion of images depending on device size
   var img_posX_start_ratio = c[0].height / wall_images[i].imgHeight;
   img_posX_start = img_posX_start;

   // if the image should be in view we draw it
   if( wall_images[i].sx + wall_images[i].imgWidth + x > 0 && x < canvasEnd ) {
      ctx.drawImage(wall_images[i].img, img_posX_start, 0, wall_images[i].imgWidth*img_posX_start_ratio, wall_images[i].imgHeight*img_posX_start_ratio);
    }
    // if the start of current image position isn't before the canvas end, we need not go further break out
    if( img_posX_start + x  > canvasEnd ) {
      break;
    }
  };

} // END: function draw

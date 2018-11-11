 if (window.jQuery) { 
  $(document).ready(function(){
    if (window.devicePixelRatio > 1) {
      var images = findImagesByRegexp('contacts_thumbnail', document);

      for(var i = 0; i < images.length; i++) {
        var lowres = images[i].src;
        old_size = lowres.match(/\/(\d*)$/)[1]
        var highres = lowres.replace(/\/(\d*)$/, "/" + String(old_size*2));
        images[i].src = highres;
      }

      var images = findImagesByRegexp('gravatar.com/avatar', document);

      for(var i = 0; i < images.length; i++) {
        var lowres = images[i].src;
        old_size = lowres.match(/size=(\d+)x(\d+)/)[1]
        var highres = lowres.replace(/size=(\d+)x(\d+)/, "size=" + String(old_size*2));
        images[i].src = highres;
      }    
    }
  });
} else {
  document.observe("dom:loaded", function() {
    if (window.devicePixelRatio > 1) {
      var images = findImagesByRegexp('thumbnail', document);

      for(var i = 0; i < images.length; i++) {
        var lowres = images[i].src;
        old_size = lowres.match(/size=(\d*)$/)[1]
        var highres = lowres.replace(/size=(\d*)$/, "size=" + String(old_size*2));
        images[i].src = highres;
      }

      var images = findImagesByRegexp('gravatar.com/avatar', document);

      for(var i = 0; i < images.length; i++) {
        var lowres = images[i].src;
        old_size = lowres.match(/size=(\d+)x(\d+)/)[1]
        var highres = lowres.replace(/size=(\d+)x(\d+)/, "size=" + String(old_size*2));
        images[i].src = highres;
      }    
    }

  });
}

function findImagesByRegexp(regexp, parentNode) {
   var images = Array.prototype.slice.call((parentNode || document).getElementsByTagName('img'));
   var length = images.length;
   var ret = [];
   for(var i = 0; i < length; ++i) {
      if(images[i].src.search(regexp) != -1) {
         ret.push(images[i]);
      }
   }
   return ret;
};

const draggerOffsetPct = 0;
const draggerOffsetVw = 4;

// Call & init
$(document).ready(function(){
    $('.top').each(function(){
      var cur = $(this);
      // Adjust the slider
      var width = cur.find('.resize').width();
      cur.find('.handle').css('left', width + draggerOffsetVw);
      cur.find('.resize').css('width', width);
      // Bind dragging events
      drags(cur.find('.handle'), cur.find('.resize'), cur);
    });
  });
  
  function drags(dragElement, resizeElement, container) {
      
    // Initialize the dragging event on mousedown.
    dragElement.on('mousedown touchstart', function(e) {
      
      dragElement.addClass('draggable');
      resizeElement.addClass('resizable');
      
      // Check if it's a mouse or touch event and pass along the correct value
      var startX = e.pageX;
      
      // Get the initial position
      var dragWidth = dragElement.outerWidth(),
          posX = dragElement.offset().left + dragWidth - startX,
          containerOffset = container.offset().left,
          containerWidth = container.outerWidth();
   
      // Set limits
      minLeft = containerOffset + 10;
      maxLeft = containerOffset + containerWidth - dragWidth - 70;
      
      // Calculate the dragging distance on mousemove.
      dragElement.parents().on("mousemove touchmove", function(e) {
          
        // Check if it's a mouse or touch event and pass along the correct value
        var moveX = (e.pageX) ? e.pageX : e.originalEvent.touches[0].pageX;
        
        leftValue = moveX + posX - dragWidth;
        
        // Prevent going off limits
        if ( leftValue < minLeft) {
          leftValue = minLeft;
        } else if (leftValue > maxLeft) {
          leftValue = maxLeft;
        }
        
        // Translate the handle's left value to masked divs width.
        widthValue = (leftValue + dragWidth/2 - containerOffset)*100.0/containerWidth;
        leftValue = (leftValue + draggerOffsetVw + dragWidth/2 - containerOffset)*100.0/containerWidth;

        widthPct = widthValue+'%';
        leftPct = leftValue+'%';
              
        // Set the new values for the slider and the handle. 
        // Bind mouseup events to stop dragging.
        $('.resizable').css('width', widthPct);
        $('.draggable').css('left', leftPct).on('mouseup touchend touchcancel', function () {
          $(this).removeClass('draggable');
          dragElement.removeClass('draggable');
          resizeElement.removeClass('resizable');
        });

      }).on('mouseup touchend touchcancel', function(){
        dragElement.removeClass('draggable');
        resizeElement.removeClass('resizable');
      });
      e.preventDefault();
    }).on('mouseup touchend touchcancel', function(e){
      dragElement.removeClass('draggable');
      resizeElement.removeClass('resizable');
    });
  }
  
  
  
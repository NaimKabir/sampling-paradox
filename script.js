// Random particles based heavily on @trhino's work on Codepen: https://codepen.io/trhino/pen/JFmiK
// Draggable slider based heavily on @bamf's work on Codepen: https://codepen.io/bamf/pen/jEpxOX

const draggerOffsetVw = 8;
const particalSpawnVariance = 30;
const baseVelocity = 800;
const radiusMean = 20;
const radiusVariance = 5;

// Particle code

/**
 * Generates random particles using canvas
 * 
 * @class Particles
 * @constructor
 */
function Particles(){
  this.particle = [];
  //particle colors
  this.colors = {
    sampled: '255, 99, 71',
    unsampled: '54, 54, 54',
  }
  this.opacity = 0.4;
  //particle radius min/max. particle speed is derived solely from radius.
  this.minRadius = 10; 
  this.maxRadius = 35;
  //frames per second 
  this.fps = 60;
  //number of particles
  this.numParticles = 75;
  //required canvas variables
  this.canvas = document.getElementById('canvas');
  this.ctx = this.canvas.getContext('2d');

  // Keep track of animation state
  this.isAnimating = false;
}

/**
 * Initializes everything
 * @method init
 */
Particles.prototype.init = function(){
  this.particle = [];
  this.render();
  this.createCircle();
}

/**
 * generates random number between min and max values
 * @param  {number} min value
 * @param  {number} max malue
 * @return {number} random number between min and max
 * @method _rand
 */
Particles.prototype._rand = function(min, max){
  return Math.random() * (max - min) + min;
}

Particles.prototype._wrand = function(){
  var u = 0, v = 0;
  while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

/**
 * Sets canvas size and updates values on resize
 * @method render
 */
Particles.prototype.render = function(){ 
  var self = this,
      wHeight = $(window).height(),
      wWidth = $(window).width();
  
  self.canvas.width = wWidth;
  self.canvas.height = wHeight;
  
  $(window).on('resize', self.render);
}

/**
 * Randomly creates particle attributes
 * @method createCircle
 */
Particles.prototype.createCircle = function(){
  for (var i = 0; i < this.numParticles; i++) {
    var self = this;
    var color = self.colors.unsampled;

    // Base velocity will be divided by the area of a particle
    let radius = self._wrand()*radiusVariance + radiusMean;
    radius = radius < 0? Math.abs(radius) : radius;
    const velocity = baseVelocity / (Math.PI*(radius*radius));

    // Convert raw velocity into x and y components with a randomized angle
    const direction = self._rand(0, 2*Math.PI);
    const xVelocity = Math.cos(direction)*velocity;
    const yVelocity = Math.sin(direction)*velocity;
    
    self.particle[i] = {
      radius    : radius,
      xPos      : self._wrand() * particalSpawnVariance + canvas.width/2,
      yPos      : self._wrand() * particalSpawnVariance + canvas.height/2,
      xVelocity : xVelocity,
      yVelocity : yVelocity,
      color     : 'rgba(' + color + ',' + self.opacity + ')'
    }
    
    //once values are determined, draw particle on canvas
    self.draw(self.particle, i);
  }
  //...and once drawn, animate the particle
  if (!self.isAnimating) {
    self.isAnimating = true;
    self.animate();
  }
}

/**
 * Draws particles on canvas
 * @param  {array} Particle array from createCircle method
 * @param  {number} i value from createCircle method
 * @method draw
 */
Particles.prototype.draw = function(particle, i){
  var self = this,
      ctx = self.ctx;
  
  ctx.fillStyle = particle[i].color; 
  
  ctx.beginPath();
  ctx.arc(particle[i].xPos, particle[i].yPos, particle[i].radius, 0, 2 * Math.PI, false);
  ctx.fill();
}

/**
 * Animates particles 
 * @param  {array} particle value from createCircle & draw methods
 * @method animate
 */
Particles.prototype.animate = function(){
  var self = this,
          ctx = self.ctx;
  
  setInterval(function(){
    particle = self.particle;
    //clears canvas
    self.clearCanvas();
    //then redraws particles in new positions based on velocity
    for (var i = 0; i < self.numParticles; i++) {
      particle[i].xPos += particle[i].xVelocity;
      particle[i].yPos -= particle[i].yVelocity;
     
      //if particle is going of screen, make it bounce
      if (particle[i].xPos > self.canvas.width - particle[i].radius/2 ||
          particle[i].xPos < particle[i].radius/2
      ) {
        particle[i].xVelocity *= -1; 
        self.draw(particle, i);
      } else if (
        particle[i].yPos > self.canvas.height - particle[i].radius/2 ||
        particle[i].yPos < particle[i].radius/2
      ) {
        particle[i].yVelocity *= -1; 
        self.draw(particle, i);
      }
      else {
        self.draw(particle, i);
      }
    }  
  }, 1000/self.fps); 
}

/**
 * Clears canvas between animation frames
 * @method clearCanvas
 */
Particles.prototype.clearCanvas = function(){
  this.ctx.clearRect(0, 0, canvas.width, canvas.height);
}
 
// Draggable handle code:

// Call & init
$(document).ready(function(){
  var particle = new Particles();
  particle.init();
  $('.top').each(function(){
    var cur = $(this);
    // Adjust the slider
    var width = cur.find('.resize').width();
    cur.find('.handle').css('left', width + draggerOffsetVw);
    cur.find('.resize').css('width', width);
    // Bind dragging events
    drags(cur.find('.handle'), cur.find('.resize'), cur, particle);
  });
});
  
  function drags(dragElement, resizeElement, container, particle) {      
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
          // Reset the animation on cancel
          particle.init();
        });

      }).on('mouseup touchend touchcancel', function(){
        dragElement.removeClass('draggable');
        resizeElement.removeClass('resizable');
        // Reset the animation on cancel
        particle.init();
      });
      e.preventDefault();
    }).on('mouseup touchend touchcancel', function(e){
      dragElement.removeClass('draggable');
      resizeElement.removeClass('resizable');
      // Reset the animation on cancel
      particle.init();
    });
  }
  
  
  
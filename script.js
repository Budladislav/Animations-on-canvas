"use strict";

//object with global variables
let o_GlobalVariable = {
  nCanvasSide: null, //side length. width and height are equal
  canvasContext: null,
  nAnimationRadius: null,
  nIntervalId: null, //need for set and stop function of animate
  nAnimationsVelosity: null,
  bEggLightOn: false
}

/* FUNCTIONS */
//Set settings-interface, according to settings from localStorage
//Append canvas, run animation on it, according to settings from localStorage
let fAppendCanvas = (resize) => {
  if ( fIsMobile() )
    fAdapteForMobile();

  const SETTINGS_SIZE = localStorage['lsSize'];
  const SETTINGS_AMOUNT = localStorage['lsAmount'];
  const SETTINGS_VELOSITY = localStorage['lsVelosity'];
  const SETTINGS_ANIMATION = localStorage['lsAnimation'];

  let s_Animation;
  let n_CountOfAnimations;
  let e_Canvas;
  let n_LineWidth;

  //set s_Animation variable and update input-select "#select_animation"
  if (typeof SETTINGS_ANIMATION === 'undefined' || SETTINGS_ANIMATION === null){
    s_Animation = 'bee';
    $(`#select_animation option[value=${s_Animation}]`).prop('selected','selected');
  } else {
    s_Animation = SETTINGS_ANIMATION;
    $(`#select_animation option[value=${SETTINGS_ANIMATION}]`).prop('selected','selected');
  }
  //update "max" of "#range_canvas_size" element
  let n_MinSideOfWindow = Math.min(document.documentElement.clientWidth,
    document.documentElement.clientHeight);
    //n_MinSideOfWindow rounding down to 50 and - 100 for additional ofset
    // for height (100 is approx height of folded settings-window)
  let n_RangeMax = Math.floor( n_MinSideOfWindow / 50 ) * 50 - 100;
  if (n_RangeMax < 300)
    n_RangeMax = 300; 
  $("#range_canvas_size").prop('max', n_RangeMax);

  //set o_GlobalVariable.nCanvasSide variable and update input-range "#range_canvas_size" value
  if (typeof SETTINGS_SIZE === 'undefined' || SETTINGS_SIZE === null){
    o_GlobalVariable.nCanvasSide = 200;
    $("#range_canvas_size").val(o_GlobalVariable.nCanvasSide);
  } else {
      o_GlobalVariable.nCanvasSide = SETTINGS_SIZE;
      $("#range_canvas_size").val(SETTINGS_SIZE);
      if (resize && +SETTINGS_SIZE > n_MinSideOfWindow) {
        o_GlobalVariable.nCanvasSide = n_RangeMax;
        $("#range_canvas_size").val(n_RangeMax);
      }
  }

  $("#info_size").text(` ${$("#range_canvas_size").val()} x ${$("#range_canvas_size").val()}`);

  //set n_CountOfAnimations variable and update input-number "#number_of_elements" value
  if (typeof SETTINGS_AMOUNT === 'undefined' || SETTINGS_AMOUNT === null) {
    n_CountOfAnimations = $("#number_of_elements").val();
  } else {
    n_CountOfAnimations = SETTINGS_AMOUNT;
    $("#number_of_elements").val(SETTINGS_AMOUNT);  
  }
  
  //set o_GlobalVariable.nAnimationsVelosity variable and update input-number "#number_velosity" value
  if (typeof SETTINGS_VELOSITY === 'undefined' || SETTINGS_VELOSITY === null) {
    o_GlobalVariable.nAnimationsVelosity = 110 - $("#number_velosity").val() * 10;
  } else {
    o_GlobalVariable.nAnimationsVelosity = 110 - SETTINGS_VELOSITY * 10;
    $("#number_velosity").val(SETTINGS_VELOSITY);
  }

  //append canvas and set context settings
  const sCanvasCode = `<canvas id="canvas" height=` +
    `"${o_GlobalVariable.nCanvasSide}px" `+
    `width="${o_GlobalVariable.nCanvasSide}px" ` +
    `style=" border-radius: 15px; background-color: rgb(210, 180, 140)"></canvas>`;
  $("#canvas_place").append(sCanvasCode);

  e_Canvas = document.getElementById('canvas');
  n_LineWidth = o_GlobalVariable.nCanvasSide / 100;
  o_GlobalVariable.canvasContext = e_Canvas.getContext('2d');
  o_GlobalVariable.canvasContext.strokeStyle = 'black';
  o_GlobalVariable.canvasContext.lineWidth = n_LineWidth;
  o_GlobalVariable.nAnimationRadius = o_GlobalVariable.nCanvasSide / 25;

  if (s_Animation === 'bee'){
    o_GlobalVariable.canvasContext.fillStyle = 'gold';
    let nCountOfBees = n_CountOfAnimations;
    let aBeesCoordinats = []; /*[№ofBee][0] - X [№ofBee][1] - Y*/
    let i = 0;
    for (; i < nCountOfBees; i++){
      aBeesCoordinats[i] = [];
      aBeesCoordinats[i][0] = o_GlobalVariable.nCanvasSide / 2;
      aBeesCoordinats[i][1] = o_GlobalVariable.nCanvasSide / 2;
    }
    i = 0;
    for (; i < aBeesCoordinats.length; i++){
      fDrawBee(aBeesCoordinats[i][0],aBeesCoordinats[i][1]);
    }
    fAnimateBees(aBeesCoordinats);
  } else if (s_Animation = 'ball') {
    o_GlobalVariable.canvasContext.fillStyle = 'black';
    let nCountOfBalls = n_CountOfAnimations;
    let aBallsObjects = [];
    let i = 0;
    for (; i < nCountOfBalls; i++){
      aBallsObjects[i] = new Ball();
    }
    fAnimateBalls(aBallsObjects);
  }
}

let fAdapteForMobile = () => {
  $(".settings").css('font-size','2em');
  $(".settings_hidden").css('padding','0 50px')
  $("#footer_text_desctop").css('display','none');
  $("#footer_text_mobile").css('display','inline');
  $("#select_animation").css('transform','scale(2) translateY(-5px)');
  $("#select_animation").css('font-weight','bold');
  $("#select_animation").css('font-size','0.4em');
  $("#select_animation").css('margin-left','25px');
  $("#number_of_elements").css('transform','scale(2) translateY(-5px)');
  $("#number_of_elements").css('font-weight','bold');
  $("#number_of_elements").css('font-size','0.4em');
  $("#number_of_elements").css('margin-left','25px');
  $("#number_velosity").css('transform','scale(2) translateY(-5px)');
  $("#number_velosity").css('font-weight','bold');
  $("#number_velosity").css('font-size','0.4em');
  $("#number_velosity").css('margin-left','25px');
  $("#range_canvas_size").css('transform','scaleY(4)');
  $("#range_canvas_size").css('margin','35px 0');

  $("#canvas_place").off('mousedown', hCanvasPressStart);
  $("#canvas_place").off('mouseup', hCanvasPressEnd);
  $("#canvas_place").on('touchstart', hCanvasPressStart);
  $("#canvas_place").on('touchend', hCanvasPressEnd);
}

let fDrawCircle = (Xcenter,Ycenter,radius,fill) => {
  if (fill === undefined) fill = false;
  if (radius === undefined) return;
  if (Xcenter === undefined) Xcenter = 0;
  if (Ycenter === undefined) Ycenter = 0;
  o_GlobalVariable.canvasContext.beginPath();
  o_GlobalVariable.canvasContext.arc(Xcenter, Ycenter, radius, 0, Math.PI * 2);
  (fill) ? o_GlobalVariable.canvasContext.fill() : o_GlobalVariable.canvasContext.stroke();
}

let fDrawBee = (Xcenter,Ycenter) => {
  const n_WINGS_OFFSET_X = o_GlobalVariable.nCanvasSide / 50;
  const n_WINGS_OFFSET_Y = o_GlobalVariable.nCanvasSide / 20;
  const n_WINGS_RADIUS = n_WINGS_OFFSET_X
  const n_EYES_OFFSET_X = o_GlobalVariable.nCanvasSide / 100;
  const n_EYES_OFFSET_Y = o_GlobalVariable.nCanvasSide / 200;
  const n_EYES_RADIUS = n_EYES_OFFSET_X;
  //body
  fDrawCircle(Xcenter, Ycenter, o_GlobalVariable.nAnimationRadius, true);
  fDrawCircle(Xcenter, Ycenter, o_GlobalVariable.nAnimationRadius, false);
  //wings
  fDrawCircle(Xcenter - n_WINGS_OFFSET_X, Ycenter - n_WINGS_OFFSET_Y, n_WINGS_RADIUS, false);
  fDrawCircle(Xcenter + n_WINGS_OFFSET_X, Ycenter - n_WINGS_OFFSET_Y, n_WINGS_RADIUS, false);
  //eyes
  fDrawCircle(Xcenter - n_EYES_OFFSET_X, Ycenter - n_EYES_OFFSET_Y, n_EYES_RADIUS, false);
  fDrawCircle(Xcenter + n_EYES_OFFSET_X, Ycenter - n_EYES_OFFSET_Y, n_EYES_RADIUS, false); 
}

//update all coordinates in array of bees and redraw it on canvas
let fAnimateBees = (aCoordinats) => {
  o_GlobalVariable.nIntervalId = setInterval( () => {
    o_GlobalVariable.canvasContext.clearRect(0,0,o_GlobalVariable.nCanvasSide,
      o_GlobalVariable.nCanvasSide);
    let i = 0;
    for (; i < aCoordinats.length; i++){
      aCoordinats[i][0] = fUpdateBeeCoordinate(aCoordinats[i][0]);
      aCoordinats[i][1] = fUpdateBeeCoordinate(aCoordinats[i][1]);
      fDrawBee(aCoordinats[i][0], aCoordinats[i][1]);
    }
  },o_GlobalVariable.nAnimationsVelosity);
}

//auxiliary function for fAnimateBees(). change coordinate in random offset
//taking into account the uniform distribution of bees on canvas
let fUpdateBeeCoordinate = (coordinate) => {
  let n_RandomFrom = o_GlobalVariable.nCanvasSide / 50;
  const n_START_SIDE = 200;
  const n_START_PLUS_MINUS = 1.5;
  let n_Current_Plus_minus;
  if ( +o_GlobalVariable.nCanvasSide === n_START_SIDE) {
    n_Current_Plus_minus = n_START_PLUS_MINUS;
  } else {
    n_Current_Plus_minus = (o_GlobalVariable.nCanvasSide - n_START_SIDE) / 50
      * 0.5 + n_START_PLUS_MINUS;
  }
  
  //random offset, taking into account the uniform distribution Bees on canvas
  //n_Current_Plus_minus variable provides uniform distribution of bees
  coordinate += Math.random() * n_RandomFrom - n_Current_Plus_minus;
  //check for bee dont get outside canvas
  if (coordinate > o_GlobalVariable.nCanvasSide - o_GlobalVariable.nAnimationRadius )
    coordinate = o_GlobalVariable.nCanvasSide - o_GlobalVariable.nAnimationRadius;
  if (coordinate < o_GlobalVariable.nAnimationRadius)
    coordinate = o_GlobalVariable.nAnimationRadius;
  return Math.floor(coordinate);
}

//update all coordinates in array of balls and redraw it on canvas
let fAnimateBalls = (ArrayWithObjects) => {
  o_GlobalVariable.nIntervalId = setInterval( () => {
    o_GlobalVariable.canvasContext.clearRect(0,0,o_GlobalVariable.nCanvasSide,
      o_GlobalVariable.nCanvasSide);
    let i = 0;
    for (; i < ArrayWithObjects.length; i++){
      ArrayWithObjects[i].draw();
      ArrayWithObjects[i].move();
      ArrayWithObjects[i].checkCollision();
    }
  } , o_GlobalVariable.nAnimationsVelosity);
}

//auxiliary function for Ball.prototype.fRandomMoveDirection()
//change canvas shadow-box for 0.1s
let fCanvasBlink = () => {
  const s_INITIAL = `inset rgba(0,0,0,.5) -3px -3px 8px,
    inset rgba(255,255,255,.9) 3px 3px 8px,
    rgba(0,0,0,.8) 3px 3px 25px -3px`;
  const s_EFFECT = `inset rgba(0,0,0,.5) -3px -3px 8px,
    inset rgba(255,255,255,.9) 3px 3px 8px,
    rgba(0,0,0,.8) 3px 3px 20px -3px`;
  $("canvas").css('box-shadow', s_EFFECT);
  setTimeout( () => {$("canvas").css('box-shadow', s_INITIAL);} ,100);
}
let fRemoveCurentCanvas = () => {
  clearInterval(o_GlobalVariable.nIntervalId);
  $("canvas").remove();
}

//function for new feature - 'resizeend' and 'resizestart' event,
//don't understand clearly how it works, but it works decent
(function ($) {
  var d = 250, t = null, e = null, h, r = false;
  h = function () {
      r = false;
      $(window).trigger('resizeend', e);
  };
  $(window).on('resize', function (event) {
      e = event || e;
      clearTimeout(t);
      if (!r) {
          $(window).trigger('resizestart', e);
          r = true;
      }
      t = setTimeout(h, d);
  });
}(jQuery));

//check is it device mobile (with touchscreen). True - mobile/ false - desctop
function fIsMobile() { return ('ontouchstart' in document.documentElement); }

/* FUNCTIONS end */

/* EVENT HANDLERS */
//handles clicks on triangle-toggle. unfolds and folds hidden menu
let hOptionsClick = (event) => {
  //dont fold option-window, when click on link or control fields
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT'
    ||  event.target.tagName === 'A') return;
 
  if ( $(".settings_hidden").css('display') === 'none'){
    $("#menu_img").css('transform','rotate(540deg)');
    $(".settings").css(
      {
        'position': 'absolute',
        'border': 'none',
        'box-shadow': '0px 0px 15px 7px rgba(56,24,240,1)'
      });
    $(".settings_hidden").css('display','flex');
    if (!fIsMobile())
     $("#footer_text_desctop").css('display','inline');
  } else {
    $(".settings").css(
      {
        'position': 'static',
        'box-shadow': 'none',
        'border-right': '5px solid black',
        'border-bottom': '5px solid black',
        'border-left': '5px solid black'
      });
    $(".settings_hidden").css('display','none');
    $("#menu_img").css('transform','none');
    $("#footer_text_desctop").css('display','none');
  }
}
//handles change of "#range_canvas_size" input-range.
let hUpdateSettingSize = () => {
  localStorage['lsSize'] = $("#range_canvas_size").val();
  fRemoveCurentCanvas();
  fAppendCanvas();
}
//handles change of "#select_animation" input-select.
let hAnimationChange = (event) => {
  if (event.currentTarget.value === 'bee') {
    localStorage['lsAnimation'] = 'bee';
  } else if (event.currentTarget.value === 'ball') 
      localStorage['lsAnimation'] = 'ball';
    
  fRemoveCurentCanvas();
  fAppendCanvas();
}
//handles change of "#number_of_elements" input-number.
let hChangeNumberOfAnimations = (event) => {
  if(event.currentTarget.value !== localStorage['lsAmount']) {
    if (event.currentTarget.value > 50) event.currentTarget.value = 50;
    localStorage['lsAmount'] = event.currentTarget.value;
    fRemoveCurentCanvas();
    fAppendCanvas();
  }  
}
//handles change of "#number_velosity" input-number.
let hChangeVelosityOfAnimations = (event) => {
  if(event.currentTarget.value !== localStorage['lsVelosity']) {
    if (event.currentTarget.value > 10) event.currentTarget.value = 10;
    if (event.currentTarget.value < 0) event.currentTarget.value = 1;
    localStorage['lsVelosity'] = event.currentTarget.value;
    fRemoveCurentCanvas();
    fAppendCanvas();
  }     
}
//handles ending of resize window
let hResizeWindow = () => {
  fRemoveCurentCanvas();
  localStorage['lsSize'] = $("#range_canvas_size").val();
  fAppendCanvas(true);
}
//Easter egg. Canvas shadow channging
let hCanvasPressStart = () => {
  const s_DEPTH_ON = `inset 2px 2px 5px rgba(0,0,0, 0.5),
    1px 1px 5px rgba(255, 255, 255, 1)`; 
  $("canvas").css('box-shadow', s_DEPTH_ON);
}
//Easter egg. Canvas shadow channging
let hCanvasPressEnd = () => {
  const s_DEPTH_OFF = `inset rgba(0,0,0,.5) -3px -3px 8px,
    inset rgba(255,255,255,.9) 3px 3px 8px,
    rgba(0,0,0,.8) 3px 3px 25px -3px`;
  const s_LIGHT_ON = `inset rgba(0,0,0,.5) -3px -3px 8px,
    inset rgba(255,255,255,.9) 3px 3px 8px,
    0 -20px 20px -5px rgba(255, 0, 0, 0.8),
    20px 0 20px -5px rgba(0, 0, 255, 0.8),
    0 20px 20px -5px rgba(255, 255, 0, 0.8),
    -20px 0 20px -5px rgba(0, 255, 0, 0.8)`;
  const s_LIGHT_OFF = `inset rgba(0,0,0,.5) -3px -3px 8px,
    inset rgba(255,255,255,.9) 3px 3px 8px,
    rgba(0,0,0,.8) 3px 3px 25px -3px`;
  $("canvas").css('box-shadow', s_DEPTH_OFF);
  (o_GlobalVariable.bEggLightOn) ? $("canvas").css('box-shadow', s_LIGHT_OFF) :
    $("canvas").css('box-shadow', s_LIGHT_ON);
  (o_GlobalVariable.bEggLightOn) ? o_GlobalVariable.bEggLightOn = false :
    o_GlobalVariable.bEggLightOn = true;
}
/* EVENT HANDLERS end */

/* EVENTS */
$(".settings").click(hOptionsClick);
$("#range_canvas_size").on("input", hUpdateSettingSize); //"change"?
$("#select_animation").change(hAnimationChange);
$("#number_of_elements").on('keyup change click', hChangeNumberOfAnimations);
$("#number_velosity").on('keyup change click', hChangeVelosityOfAnimations);
$(window).on('resizeend', hResizeWindow);
//Had trouble to handle event directly on canvas.
//It works only in case html attribute connection
$("#canvas_place").on('mousedown', hCanvasPressStart); //replase on touchstart when mobile
$("#canvas_place").on('mouseup', hCanvasPressEnd); //replase on touchend when mobile
/* EVENTS end */

/* CONSTRUCTORS */

//add object ball with coordinates center of canvas and random direction
let Ball = function() {
  this.x = o_GlobalVariable.nCanvasSide / 2;
  this.y = o_GlobalVariable.nCanvasSide / 2;
  this.direction = this.fRandomMoveDirection();
}
/* CONSTRUCTORS end */

/* PROTOTYPE PROPERTYS */

//draw filled black ball. false - only contour of ball 
Ball.prototype.draw = function () {
  fDrawCircle(this.x, this.y, o_GlobalVariable.nAnimationRadius, true);
}

//change x and y coordinates of ball on directionX and directionY value respectively
Ball.prototype.move = function () {
  this.x += this.direction[0];
  this.y += this.direction[1];
}

//if ball reach any side of canvas - inverd direction, and blink canvas shadow,
// in case if easter egg light off
Ball.prototype.checkCollision = function () {
  let radius = o_GlobalVariable.nAnimationRadius;
  if (this.x + radius > o_GlobalVariable.nCanvasSide || this.x - radius < 0){
    this.direction[0] = -this.direction[0];
    if (!o_GlobalVariable.bEggLightOn)
      fCanvasBlink();
  }
    
  if (this.y + radius > o_GlobalVariable.nCanvasSide || this.y - radius < 0){
    this.direction[1] = -this.direction[1];
    if (!o_GlobalVariable.bEggLightOn)
      fCanvasBlink();
  }
}

//return array with 1 dot coordinate: [0] - x between -MaxMin and MaxMin,
// [1] - y between -MaxMin and MaxMin;
//x and y cant be zero and equal by module to each other
Ball.prototype.fRandomMoveDirection = () => {
  let aReturnArray = [];
  let randomFrom = Math.floor( o_GlobalVariable.nCanvasSide/30 ) + 1;
  let MaxMin = randomFrom/2;
  do {
    aReturnArray[0] = Math.floor( Math.random() * randomFrom - MaxMin);
    aReturnArray[1] = Math.floor( Math.random() * randomFrom - MaxMin);   
  } while (aReturnArray[0] === 0 || aReturnArray[1] === 0
      || Math.abs(aReturnArray[0]) === Math.abs(aReturnArray[1]))
  return aReturnArray;
}

/* PROTOTYPE PROPERTYS end */

/* MAIN CODE */
fAppendCanvas();
/* MAIN CODE end */

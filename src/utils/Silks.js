import { __bind } from './helpers'
import Recorder from './Recorder'
import Silk from './Silk'
import CanvasUtil from './CanvasUtil'
import Sparks from './Sparks'

function Silks(container, silkCanvas, bufferCanvas, sparksCanvas) {
  this.container = container;
  this.silkCanvas = silkCanvas;
  this.bufferCanvas = bufferCanvas;
  this.sparksCanvas = sparksCanvas;
  this.replayReplay = __bind(this.replayReplay, this);
  this.undo = __bind(this.undo, this);
  this.clear = __bind(this.clear, this);
  this.all = {};
  this.sparks = new Sparks(this.sparksCanvas);
  this.recorder = new Recorder(this);
  this.silkCtx = this.silkCanvas.getContext('2d');
  this.sparksCtx = this.sparksCanvas.getContext('2d');
  this.sparksCanvas._util = new CanvasUtil(this.sparksCanvas);
  this.bufferCanvas._util = new CanvasUtil(this.bufferCanvas);
  this.silkCanvas._util = new CanvasUtil(this.silkCanvas);
  this.backgroundColor = '#000';
  this.snapshotState = {
    justCleared: ko.observable(true),
    canUndo: ko.observable(false)
  };
  this.previewSilks = {};
  this.inputPreviewSilk = null;
  this.inputPreviewSilkId = null;
  this.nextUndoIsRedo = ko.observable(false);
  this.undoSnapshot = null;
  this.clearUndoSnapshot = null;
  this.silkSettingsState = $.extend(true, {}, Silk.initialState);
  this.fillSilkCanvas();
  this.drawInputPreview = true;
  this.frameTime = 0;
}

Silks.prototype.scaleInfo = function () {
  return {
    logicalWidth: this.silkCanvas._util.widthOnScreen,
    logicalHeight: this.silkCanvas._util.heightOnScreen
  };
}
  ;

Silks.prototype.frame = function (dt) {
  var id, silk, _ref1, _ref2, _results;
  this.frameTime++;
  this.recorder.frame();
  if (this.trackingInput) {
    this.inputFrame();
  }
  _ref1 = this.all;
  for (id in _ref1) {
    silk = _ref1[id];
    silk.frame();
    if (silk.isFinishedDrawing()) {
      delete this.all[id];
    }
  }
  if (this.allSilksCompleted()) {
    this.recorder.stopRecording();
  }
  this.sparks.frame(dt);
  _ref2 = this.previewSilks;
  _results = [];
  for (id in _ref2) {
    silk = _ref2[id];
    if (!(this.drawInputPreview === false && id === this.inputPreviewSilkId)) {
      silk.frame();
    }
    if (silk.isFinishedDrawing()) {
      _results.push(delete this.previewSilks[id]);
    } else {
      _results.push(void 0);
    }
  }
  return _results;
}
  ;

Silks.prototype.randomId = function () {
  return Math.round(Math.random() * 9999999999) + '';
}
  ;

Silks.prototype.extendSilkSettingsState = function (state) {
  return $.extend(this.silkSettingsState, state);
}
  ;

Silks.prototype.silkStartState = function () {
  var state;
  state = $.extend(true, {}, this.silkSettingsState);
  if (state.symCenter === 'centerScreen') {
    $.extend(state, {
      symCenterX: this.silkCanvas._util.halfWidthOnScreen,
      symCenterY: this.silkCanvas._util.halfHeightOnScreen
    });
  }
  return state;
}
  ;

Silks.prototype.add = function (id, state) {
  var color, scaleInfo, silk;
  this.undoSnapshot = this.takeSnapshot();
  this.clearUndoSnapshot = null;
  this.nextUndoIsRedo(false);
  this.snapshotState.justCleared(false);
  this.recorder.startRecording();
  if (id == null) {
    id = this.randomId();
  }
  scaleInfo = this.scaleInfo();
  if (state != null) {
    silk = new Silk(this.silkCtx, scaleInfo, state);
  } else if (this.inputPreviewSilkId != null) {
    silk = new Silk(this.silkCtx, scaleInfo, this.inputPreviewSilk.serialize());
  } else {
    silk = new Silk(this.silkCtx, scaleInfo, this.silkStartState());
  }
  silk.setSparks(this.sparks);
  if (typeof Hue !== "undefined" && Hue !== null) {
    color = d3.hsl(silk.color);
    d('color:', color);
    Hue.setBri(3, parseInt(255 * color.l));
    d(color.h, color.s, color.l);
    d(Hue.setHueSat(3, parseInt(65536 * (color.h / 360)), parseInt(255 * color.s)));
  }
  this.recorder.rec('add', id, silk.serialize());
  this.all[id] = silk;
  return id;
}
  ;

Silks.prototype.addPreviewSilk = function (state) {
  var id, startState;
  id = this.randomId();
  startState = this.silkStartState();
  if (state != null) {
    $.extend(startState, state);
  }
  this.previewSilks[id] = new PointPreviewSilk(this.sparksCtx, this.scaleInfo(), startState);
  return id;
}
  ;

Silks.prototype.getPreviewSilk = function (id) {
  return this.previewSilks[id];
}
  ;

Silks.prototype.removePreviewSilk = function (id) {
  return delete this.previewSilks[id];
}
  ;

Silks.prototype.nextInputPreviewSilk = function () {
  if (this.inputPreviewSilkId != null) {
    this.inputPreviewSilk.completeAndFadeOut();
  }
  this.inputPreviewSilkId = this.addPreviewSilk();
  this.inputPreviewSilk = this.previewSilks[this.inputPreviewSilkId];
  return this.inputPreviewSilk.fadeInFromZero();
}
  ;

Silks.prototype.addPoint = function (id, x, y, vx, vy, fromRecording) {
  var scaleInfo;
  if (!fromRecording) {
    0;
    scaleInfo = this.scaleInfo();
  }
  this.recorder.rec('addPoint', id, x, y, vx, vy, true);
  if (id in this.all) {
    return this.all[id].addPoint(x, y, vx, vy);
  }
}
  ;

Silks.prototype.complete = function (id) {
  if (id in this.all) {
    this.all[id].complete();
    return this.recorder.rec('complete', id);
  }
}
  ;

Silks.prototype.allSilksCompleted = function () {
  var id, silk, _ref1;
  _ref1 = this.all;
  for (id in _ref1) {
    silk = _ref1[id];
    if (!silk.completed) {
      return false;
    }
  }
  return true;
}
  ;

Silks.prototype.clear = function (withParticles) {
  var id;
  if (withParticles == null) {
    withParticles = true;
  }
  if (!this.snapshotState.justCleared()) {
    this.clearUndoSnapshot = this.takeSnapshot();
    this.clearUndoSnapshot.nextUndoIsRedo = this.nextUndoIsRedo();
    this.nextUndoIsRedo(false);
    this.snapshotState.justCleared(true);
    this.recorder.stopRecording();
    this.recorder.ejectAll();
  }
  for (id in this.all) {
    this.complete(id);
  }
  this.all = {};
  this.swapSilkCanvii();
  if (withParticles) {
    return this.addParticles();
  }
}
  ;

Silks.prototype.addParticles = function (dir, num) {
  var angle, h, h2, i, scale, spark, w, w2, x, y, _i, _results;
  if (dir == null) {
    dir = 1;
  }
  if (num == null) {
    num = 100;
  }
  w = this.silkCanvas._util.widthOnScreen;
  h = this.silkCanvas._util.heightOnScreen;
  w2 = w / 2;
  h2 = h / 2;
  scale = .25 * dir;
  _results = [];
  for (i = _i = 1; 1 <= num ? _i <= num : _i >= num; i = 1 <= num ? ++_i : --_i) {
    x = _.random(w);
    y = _.random(h);
    angle = Math.atan2(y - h2, x - w2);
    _results.push(spark = this.sparks.add(x, y, {
      a: 1,
      color: '#ffffff',
      vx: scale * Math.cos(angle),
      vy: scale * Math.sin(angle),
      lifespan: 25 + _.random(60)
    }));
  }
  return _results;
}
  ;

Silks.prototype.swapSilkCanvii = function () {
  var _ref1;
  _ref1 = [this.bufferCanvas, this.silkCanvas],
    this.silkCanvas = _ref1[0],
    this.bufferCanvas = _ref1[1];
  this.silkCtx = this.silkCanvas.getContext('2d');
  $(this.silkCanvas).removeClass('buffer onepacity').addClass('active zeropacity').insertBefore($(this.bufferCanvas));
  $(this.bufferCanvas).removeClass('active').addClass('buffer onepacity');
  this.fillSilkCanvas();
  return _.defer((function (_this) {
    return function () {
      return $(_this.silkCanvas).removeClass('zeropacity');
    }
      ;
  }
  )(this));
}
  ;

Silks.prototype.fillCanvas = function (canvas, color) {
  var ctx;
  ctx = canvas.getContext('2d');
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  if (color === '' || color === 'transparent') {
    return ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  } else {
    return ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}
  ;

Silks.prototype.clearSilkCanvas = function () {
  return this.fillCanvas(this.silkCanvas, 'transparent');
}
  ;

Silks.prototype.fillSilkCanvas = function (color) {
  if (color == null) {
    color = this.backgroundColor;
  }
  return this.fillCanvas(this.silkCanvas, color);
}
  ;

Silks.prototype.nextSnapshotCanvas = (function () {
  var canvii, i, _i;
  canvii = [];
  for (i = _i = 1; _i <= 4; i = ++_i) {
    canvii.push(document.createElement('canvas'));
  }
  i = 0;
  return function () {
    var canvas;
    canvas = canvii[i];
    i = (i + 1) % canvii.length;
    return canvas;
  }
    ;
}
)();

Silks.prototype.takeSnapshot = function () {
  var all, binding, bindingValues, canvas, id, name, recorder, silk, sizeOnScreen, _ref1, _ref2;
  canvas = this.nextSnapshotCanvas();
  canvas.width = this.silkCanvas.width;
  canvas.height = this.silkCanvas.height;
  canvas.getContext('2d').drawImage(this.silkCanvas, 0, 0, canvas.width, canvas.height);
  all = {};
  _ref1 = this.all;
  for (id in _ref1) {
    silk = _ref1[id];
    all[id] = silk.serialize();
  }
  recorder = this.recorder.serialize();
  bindingValues = {};
  _ref2 = this.snapshotState;
  for (name in _ref2) {
    binding = _ref2[name];
    bindingValues[name] = binding();
  }
  sizeOnScreen = {
    width: this.silkCanvas._util.widthOnScreen,
    height: this.silkCanvas._util.heightOnScreen
  };
  return {
    all: all,
    canvas: canvas,
    recorder: recorder,
    sizeOnScreen: sizeOnScreen,
    bindingValues: bindingValues
  };
}
  ;

Silks.prototype.loadSnapshot = function (data) {
  var id, name, scaleInfo, state, value, _ref1, _ref2, _results;
  this.silkCtx.globalAlpha = 1;
  this.fillSilkCanvas();
  this.silkCtx.drawImage(data.canvas, (this.silkCanvas._util.widthOnScreen - data.sizeOnScreen.width) / 2, (this.silkCanvas._util.heightOnScreen - data.sizeOnScreen.height) / 2, data.sizeOnScreen.width, data.sizeOnScreen.height);
  this.all = {};
  scaleInfo = this.scaleInfo();
  _ref1 = data.all;
  for (id in _ref1) {
    state = _ref1[id];
    this.all[id] = new Silk(this.silkCtx, scaleInfo, state);
  }
  this.recorder.unserialize(data.recorder);
  _ref2 = data.bindingValues;
  _results = [];
  for (name in _ref2) {
    value = _ref2[name];
    _results.push(this.snapshotState[name](value));
  }
  return _results;
}
  ;

Silks.prototype.undo = function () {
  var snapshot;
  switch (false) {
    case this.clearUndoSnapshot == null:
      this.swapSilkCanvii();
      this.loadSnapshot(this.clearUndoSnapshot);
      this.nextUndoIsRedo(this.clearUndoSnapshot.nextUndoIsRedo);
      this.clearUndoSnapshot = null;
      return this.addParticles(-1);
    case this.undoSnapshot == null:
      snapshot = this.takeSnapshot();
      this.swapSilkCanvii();
      this.loadSnapshot(this.undoSnapshot);
      if (this.nextUndoIsRedo()) {
        this.addParticles();
      } else {
        this.addParticles(-1);
      }
      this.nextUndoIsRedo(!this.nextUndoIsRedo());
      return this.undoSnapshot = snapshot;
  }
}
  ;

Silks.prototype.replayReplay = function () {
  var tape;
  tape = this.recorder.ejectAll();
  this.clear(false);
  return this.recorder.play(tape);
}
  ;

Silks.prototype.getReplay = function () {
  return this.recorder.get();
}
  ;

Silks.prototype.playReplay = function (tape) {
  return this.recorder.play(tape);
}
  ;

Silks.prototype.makeThumb = function () {
  var canvas, ctx, drawHeight, drawWidth, r, size;
  canvas = document.createElement('canvas');
  size = 300;
  canvas.width = canvas.height = size;
  drawWidth = drawHeight = size;
  r = this.silkCanvas.width / this.silkCanvas.height;
  if (r < 1) {
    drawHeight *= r;
  } else {
    drawWidth *= r;
  }
  ctx = canvas.getContext('2d');
  ctx.fillStyle = this.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = ctx.webkitImageSmoothingEnabled = ctx.mozImageSmoothingEnabled = true;
  ctx.drawImage(this.silkCanvas, (size - drawWidth) / 2, (size - drawHeight) / 2, drawWidth, drawHeight);
  return canvas.toDataURL('image/png').replace(/^data:image\/\w+;base64,/, '');
}
  ;

Silks.prototype.getImageUrl = function () {
  return this.silkCanvas.toDataURL('image/png');
}
  ;

Silks.prototype.inputFrame = function () {
  var _ref1;
  if (this.pinputX != null) {
    if (this.inputIsActive) {
      this.addPoint(this.activeSilkId, this.inputX, this.inputY, this.inputX - this.pinputX, this.inputY - this.pinputY);
    } else {
      if ((_ref1 = this.inputPreviewSilk) != null) {
        _ref1.addPoint(this.inputX, this.inputY, this.inputX - this.pinputX, this.inputY - this.pinputY);
      }
    }
  }
  this.pinputX = this.inputX;
  return this.pinputY = this.inputY;
}
  ;

Silks.prototype.initInputEvents = function () {
  var fadeTimer, previewActive;
  this.trackingInput = true;
  this.inputX = this.inputY = null;
  this.pinputX = this.pinputY = null;
  this.inputIsActive = false;
  this.nextInputPreviewSilk();
  fadeTimer = null;
  previewActive = (function (_this) {
    return function () {
      var _ref1;
      if (!_this.inputIsActive) {
        if ((_ref1 = _this.inputPreviewSilk) != null) {
          _ref1.fadeIn();
        }
      }
      clearTimeout(fadeTimer);
      return fadeTimer = setTimeout(function () {
        var _ref2;
        return (_ref2 = _this.inputPreviewSilk) != null ? _ref2.fadeOut() : void 0;
      }, 3000);
    }
      ;
  }
  )(this);
  $(this.sparksCanvas).mousedown((function (_this) {
    return function (e) {
      if (e.button === 2) {
        return;
      }
      _this.updateInputFromEvent(e);
      _this.stopPreviewingInput();
      _this.inputStarted();
      return false;
    }
      ;
  }
  )(this)).mousemove((function (_this) {
    return function (e) {
      _this.updateInputFromEvent(e);
      return previewActive();
    }
      ;
  }
  )(this)).mouseup((function (_this) {
    return function (e) {
      _this.updateInputFromEvent(e);
      if (_this.inputIsActive) {
        _this.nextInputPreviewSilk();
        _this.inputEnded();
      }
      return previewActive();
    }
      ;
  }
  )(this)).mouseenter((function (_this) {
    return function (e) {
      return _this.nextInputPreviewSilk();
    }
      ;
  }
  )(this)).mouseleave((function (_this) {
    return function (e) {
      _this.stopPreviewingInput();
      return clearTimeout(fadeTimer);
    }
      ;
  }
  )(this)).bind('touchstart', (function (_this) {
    return function (e) {
      var _ref1;
      _this.updateInputFromEvent(_this.firstTouch(e));
      _ref1 = [_this.inputX, _this.inputY],
        _this.pinputX = _ref1[0],
        _this.pinputY = _ref1[1];
      _this.inputStarted();
      return false;
    }
      ;
  }
  )(this)).bind('touchmove', (function (_this) {
    return function (e) {
      _this.updateInputFromEvent(_this.firstTouch(e));
      return false;
    }
      ;
  }
  )(this)).bind('touchend', (function (_this) {
    return function (e) {
      _this.updateInputFromEvent(_this.firstTouch(e));
      _this.inputEnded();
      return false;
    }
      ;
  }
  )(this));
  return $(window).mouseup((function (_this) {
    return function () {
      return _this.inputIsActive = false;
    }
      ;
  }
  )(this));
}
  ;

Silks.prototype.stopPreviewingInput = function () {
  var _ref1;
  if ((_ref1 = this.inputPreviewSilk) != null) {
    _ref1.completeAndFadeOut();
  }
  return this.inputPreviewSilkId = null;
}
  ;

Silks.prototype.inputStarted = function () {
  this.inputIsActive = true;
  this.complete(this.activeSilkId);
  return this.activeSilkId = this.add();
}
  ;

Silks.prototype.inputEnded = function () {
  this.complete(this.activeSilkId);
  return this.inputIsActive = false;
}
  ;

Silks.prototype.firstTouch = function (e) {
  return e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
}
  ;

Silks.prototype.updateInputFromEvent = function (e) {
  this.inputX = e.pageX - this.container.offsetLeft;
  return this.inputY = e.pageY - this.container.offsetTop;
}
  ;

Silks.prototype.getCenterCoordinates = function () {
  return [this.silkCanvas._util.halfWidthOnScreen, this.silkCanvas._util.halfHeightOnScreen];
}

export default Silks

import * as d3 from "d3"
import { __bind, __extend } from './helpers'

function Silk(ctx, scaleInfo, state) {
  this.ctx = ctx;
  this.scaleInfo = scaleInfo;
  if (state == null) {
    state = {};
  }
  this.drawCurve = __bind(this.drawCurve, this);
  this.drawInstruction = __bind(this.drawInstruction, this);
  __extend(this, Silk.initialState, state);
  if (this.originalLogicalWidth == null) {
    this.originalLogicalWidth = this.scaleInfo.logicalWidth;
  }
  if (this.originalLogicalHeight == null) {
    this.originalLogicalHeight = this.scaleInfo.logicalHeight;
  }
  this.drawScale = Math.min(this.scaleInfo.logicalWidth / this.originalLogicalWidth, this.scaleInfo.logicalHeight / this.originalLogicalHeight, 1);
  this.offsetX = (this.scaleInfo.logicalWidth - this.originalLogicalWidth) / 2;
  this.offsetY = (this.scaleInfo.logicalHeight - this.originalLogicalHeight) / 2;
  if (this.curve == null) {
    this.curve = [];
  }
  this.initColors();
  this.cx = this.symCenterX;
  this.cy = this.symCenterY;
  this.twoCx = 2 * this.cx;
  this.twoCy = 2 * this.cy;
  this.generateDrawInstructions();
}

Silk.prototype.initColors = function () {
  var _ref1;
  switch (this.highlightMode) {
    case 'time':
      this.colorScale = d3.scale.linear().domain([this.timeColorScaleDomainLow, this.timeColorScaleDomainHigh]).range([this.highlightColor, this.color]);
      break;
    case 'velocity':
      this.colorScale = d3.scale.pow().exponent(this.velocityColorScaleExponent).domain([this.velocityColorScaleDomainLow, this.velocityColorScaleDomainHigh]).range([this.color, this.highlightColor]);
  }
  this.colorScale.clamp(true);
  this.colorScale.interpolate(d3.interpolateHcl);
  return this.isEraser = (this.color === (_ref1 = this.highlightColor) && _ref1 === this.eraserColor);
}

Silk.prototype.frame = function () {
  var i, _i, _ref1, _results;
  this.frameTime++;
  _results = [];
  for (i = _i = 1,
    _ref1 = this.drawsPerFrame; 1 <= _ref1 ? _i <= _ref1 : _i >= _ref1; i = 1 <= _ref1 ? ++_i : --_i) {
    _results.push(this.step(true));
  }
  return _results;
}

Silk.prototype.step = function (drawThisStep) {
  var accx, accy, curve, difference, dist, fx, fy, i, noiseAngle, noiseValue, p, p2, symmetryAxisAngle, windAngle, xoff, yoff, _i, _len;
  if (drawThisStep == null) {
    drawThisStep = true;
  }
  if (this.startDrawingOnceCompleted && !this.completed) {
    return;
  }
  curve = this.curve;
  this.timeColorScaleTime++;
  this.time++;
  while (curve.length && curve[0].life === 0) {
    curve.shift();
  }
  for (i = _i = 0,
    _len = curve.length; _i < _len; i = ++_i) {
    p = curve[i];
    accx = accy = 0;
    if (this.rotateAnglesAroundSymmetryAxis) {
      symmetryAxisAngle = Math.atan2(this.cx - p.y, this.cy - p.x);
    }
    if (this.noiseForceScale) {
      noiseValue = noise(this.noiseOffset + p.x * this.noiseSpaceScale + 1000000, this.noiseOffset + p.y * this.noiseSpaceScale + 1000000, this.noiseOffset + this.noiseTimeScale * this.time, this.noiseOctaves, this.noiseFallout);
      noiseAngle = this.noiseAngleOffset + this.noiseAngleScale * noiseValue;
      if (this.rotateAnglesAroundSymmetryAxis) {
        noiseAngle += symmetryAxisAngle;
      }
      accx += this.noiseForceScale * Math.cos(noiseAngle);
      accy += this.noiseForceScale * Math.sin(noiseAngle);
    }
    if (this.initialVelocityForceScale) {
      accx += this.initialVelocityForceScale * p.inputVx;
      accy += this.initialVelocityForceScale * p.inputVy;
      if (p.inputVx && p.inputVy) {
        p.inputVx *= this.initialVelocityDecay;
        p.inputVy *= this.initialVelocityDecay;
      }
    }
    if (this.windForceScale > 0) {
      windAngle = this.windAngle;
      if (this.rotateAnglesAroundSymmetryAxis) {
        windAngle += symmetryAxisAngle;
      }
      accx += this.windForceScale * Math.cos(windAngle);
      accy += this.windForceScale * Math.sin(windAngle);
    }
    p.x += (p.x - p.px) * this.friction + accx;
    p.y += (p.y - p.py) * this.friction + accy;
    p.px = p.x;
    p.py = p.y;
    p.life--;
    if (i) {
      p2 = curve[i - 1];
      xoff = p2.x - p.x;
      yoff = p2.y - p.y;
      dist = Math.sqrt(xoff * xoff + yoff * yoff);
      if (dist > this.restingDistance + 0.01) {
        difference = this.rigidity * (this.restingDistance - dist) / dist;
        fx = difference * xoff;
        fy = difference * yoff;
        p.x -= fx;
        p2.x += fx;
        p.y -= fy;
        p2.y += fy;
      }
    }
  }
  if (drawThisStep) {
    return this.draw();
  }
}

Silk.prototype.generateDrawInstructions = function () {
  var cx, cy, instr, pc, rotateAmount, rotateBy, rotationIndex, spiralIndex, spiralScaleScale, _i, _ref1, _results;
  this.drawInstructions = [];
  cx = this.cx;
  cy = this.cy;
  rotateAmount = 2 * Math.PI / this.symNumRotations;
  spiralScaleScale = d3.scale.pow().exponent(.5).domain([0, 1]).range([1, 0]);
  _results = [];
  for (rotationIndex = _i = 0,
    _ref1 = this.symNumRotations; _i < _ref1; rotationIndex = _i += 1) {
    rotateBy = rotationIndex * rotateAmount;
    _results.push((function () {
      var _j, _ref2, _results1;
      _results1 = [];
      for (spiralIndex = _j = 0,
        _ref2 = this.spiralCopies; _j < _ref2; spiralIndex = _j += 1) {
        spiralIndex = spiralIndex + 0.25 - (1 / 4);
        pc = spiralIndex / this.spiralCopies;
        instr = {
          rotationIndex: rotationIndex,
          spiralIndex: spiralIndex,
          cos: Math.cos(rotateBy + this.spiralAngle * pc),
          sin: Math.sin(rotateBy + this.spiralAngle * pc),
          scale: spiralScaleScale(pc) * this.brushScale,
          original: rotationIndex === 0 && spiralIndex === 0
        };
        this.drawInstructions.push(instr);
        if (this.symMirror) {
          _results1.push(this.drawInstructions.push(_.extend({}, instr, {
            mirror: true
          })));
        } else {
          _results1.push(void 0);
        }
      }
      return _results1;
    }
    ).call(this));
  }
  return _results;
}

Silk.prototype.draw = function () {
  var curve, instr, p, _i, _j, _k, _len, _len1, _len2, _ref1;
  curve = this.curve;
  this.setColor();
  for (_i = 0,
    _len = curve.length; _i < _len; _i++) {
    p = curve[_i];
    p.__x__ = p.x;
    p.__y__ = p.y;
  }
  _ref1 = this.drawInstructions;
  for (_j = 0,
    _len1 = _ref1.length; _j < _len1; _j++) {
    instr = _ref1[_j];
    this.drawInstruction(instr);
  }
  for (_k = 0,
    _len2 = curve.length; _k < _len2; _k++) {
    p = curve[_k];
    p.x = p.__x__;
    p.y = p.__y__;
  }
}

Silk.prototype.drawInstruction = function (instr) {
  var curve, cx, cy, p, x, y, _i, _len;
  curve = this.curve;
  cx = this.cx;
  cy = this.cy;
  if (this.scaleLineWidth) {
    this.ctx.lineWidth = instr.scale;
  }
  for (_i = 0,
    _len = curve.length; _i < _len; _i++) {
    p = curve[_i];
    x = p.__x__ - this.cx;
    y = p.__y__ - this.cy;
    p.x = (x * instr.cos - y * instr.sin) * instr.scale;
    p.y = (x * instr.sin + y * instr.cos) * instr.scale;
    if (instr.mirror) {
      p.x = -p.x;
    }
    p.x *= this.drawScale;
    p.y *= this.drawScale;
    p.x += this.cx;
    p.y += this.cy;
    p.x += this.offsetX;
    p.y += this.offsetY;
  }
  return this.drawCurve(instr);
}

Silk.prototype.drawCurve = function (instr) {
  var ctx, curve, i, lenMinusOne, p1, p2, twoCx, _i, _ref1;
  curve = this.curve;
  ctx = this.ctx;
  twoCx = this.twoCx;
  if (!curve.length) {
    return;
  }
  lenMinusOne = curve.length - 1;
  if (instr.original && this.frameTime % 10 === 0) {
    this.sparkleLine();
  }
  ctx.beginPath();
  ctx.moveTo(curve[0].x, curve[0].y);
  p1 = curve[1];
  for (i = _i = 1,
    _ref1 = lenMinusOne - 1; _i < _ref1; i = _i += 1) {
    p2 = curve[i + 1];
    ctx.quadraticCurveTo(p1.x, p1.y, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
    p1 = p2;
  }
  ctx.stroke();
}

Silk.prototype.addPoint = function (x, y, vx, vy) {
  var p;
  if (this.completed) {
    return;
  }
  p = this.curve[this.curve.length] = {
    px: x,
    py: y,
    x: x,
    y: y,
    inputVx: vx,
    inputVy: vy,
    life: this.startLife
  };
}

Silk.prototype.complete = function () {
  this.completed = true;
  if (this.stopDrawingOnceCompleted) {
    return this.curve = [];
  }
}

Silk.prototype.finish = function () {
  this.complete();
  return this.curve = [];
}

Silk.prototype.isFinishedDrawing = function () {
  return this.completed && (this.curve.length === 0 || this.stopDrawingOnceCompleted);
}

Silk.prototype.setColor = function () {
  var p;
  if (!this.curve.length) {
    return;
  }
  this.ctx.globalCompositeOperation = this.isEraser ? 'source-over' : this.compositeOperation;
  p = this.curve[this.curve.length - 1];
  this.ctx.globalAlpha = this.startOpacity * (p.life / this.startLife);
  return this.ctx.strokeStyle = this.colorScale((function () {
    switch (this.highlightMode) {
      case 'time':
        return this.timeColorScaleTime;
      case 'velocity':
        return Math.sqrt(p.inputVx * p.inputVx + p.inputVy * p.inputVy);
    }
  }
  ).call(this));
}

Silk.prototype.setSparks = function (sparks) {
  this.sparks = sparks;
  return this.sparkle = true;
}

Silk.prototype.sparkleLine = function () {
  var len;
  len = this.curve.length;
  if (len) {
    return this.sparklePoint(this.curve[_.random(len - 1)]);
  }
}

Silk.prototype.sparklePoint = function (p) {
  var color, opacity;
  if (this.sparkle) {
    opacity = 0.8 * p.life / this.startLife;
    color = d3.rgb(this.ctx.strokeStyle).brighter(2).toString();
    return this.sparks.add(p.x, p.y, {
      a: opacity,
      color: color
    });
  }
}

Silk.prototype.serialize = function () {
  var cereal, key, p, value, _i, _len, _ref1, _ref2;
  _ref1 = this.curve;
  for (_i = 0,
    _len = _ref1.length; _i < _len; _i++) {
    p = _ref1[_i];
    delete p.__x__;
    delete p.__y__;
  }
  cereal = {};
  _ref2 = Silk.initialState;
  for (key in _ref2) {
    if (!__hasProp.call(_ref2, key))
      continue;
    value = _ref2[key];
    cereal[key] = this[key];
  }
  cereal.curve = $.extend(true, [], this.curve);
  return cereal;
}

Silk.initialState = {
  type: 'silk',
  version: 1,
  time: 0,
  frameTime: 0,
  completed: false,
  startDrawingOnceCompleted: false,
  stopDrawingOnceCompleted: false,
  brushScale: 1,
  scaleLineWidth: true,
  startLife: 150,
  startOpacity: 0.09,
  color: '#276f9b',
  highlightColor: '#276f9b',
  highlightMode: 'velocity',
  eraserColor: '#000000',
  velocityColorScaleExponent: 1.5,
  velocityColorScaleDomainLow: 10,
  velocityColorScaleDomainHigh: 30,
  timeColorScaleDomainLow: 0,
  timeColorScaleDomainHigh: 350,
  timeColorScaleTime: 0,
  compositeOperation: 'lighter',
  noiseForceScale: 1,
  noiseSpaceScale: 0.02,
  noiseTimeScale: 0.005,
  noiseOffset: 0,
  noiseOctaves: 8,
  noiseFallout: 0.65,
  noiseAngleScale: 5 * Math.PI,
  noiseAngleOffset: 0,
  initialVelocityForceScale: 0.3,
  initialVelocityDecay: 0.98,
  windForceScale: 0,
  windAngle: Math.PI,
  rotateAnglesAroundSymmetryAxis: true,
  friction: 0.975,
  restingDistance: 0,
  rigidity: 0.2,
  symType: 'point',
  symNumRotations: 1,
  symMirror: true,
  symCenter: 'centerScreen',
  symCenterX: 0,
  symCenterY: 0,
  spiralCopies: 1,
  spiralAngle: 0.75 * Math.PI,
  curve: null,
  originalLogicalWidth: null,
  originalLogicalHeight: null,
  drawsPerFrame: 5
}

export default Silk
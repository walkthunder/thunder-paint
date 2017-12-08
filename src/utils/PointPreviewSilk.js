import { __bind, __extends } from './helpers'
import Silk from './Silk'

__extends(PointPreviewSilk, Silk);

function PointPreviewSilk(ctx, scaleInfo, state) {
  var baseColor;
  this.ctx = ctx;
  this.scaleInfo = scaleInfo;
  if (state == null) {
    state = {};
  }
  this.drawCurve = __bind(this.drawCurve, this);
  PointPreviewSilk.__super__.constructor.apply(this, arguments);
  if (this.previewRadius == null) {
    this.previewRadius = 4;
  }
  if (this.previewOpacity == null) {
    this.previewOpacity = 1;
  }
  if (this.targetOpacity == null) {
    this.targetOpacity = 1;
  }
  if (this.visible == null) {
    this.visible = true;
  }
  switch (this.previewEmphasis) {
    case 'spiral':
      this.previewEmphasisFn = function (instr) {
        return instr.spiralIndex > 0;
      }
      break;
    case 'rotation':
      this.previewEmphasisFn = function (instr) {
        return instr.spiralIndex === 0 && !instr.mirror;
      }
      break;
    case 'mirror':
      this.previewEmphasisFn = function (instr) {
        return instr.mirror;
      }
  }
  baseColor = (function () {
    switch (this.hightlightMode) {
      case 'time':
        return this.highlightColor;
      case 'velocity':
        return this.color;
    }
  }
  ).call(this);
}

PointPreviewSilk.prototype.frame = function () {
  if (!this.curve.length) {
    return;
  }
  switch (false) {
    case !(this.previewOpacity > this.targetOpacity):
      this.previewOpacity -= 0.05;
      if (this.previewOpacity < this.targetOpacity) {
        this.previewOpacity = this.targetOpacity;
      }
      break;
    case !(this.previewOpacity < this.targetOpacity):
      this.previewOpacity += 0.05;
      if (this.previewOpacity > this.targetOpacity) {
        this.previewOpacity = this.targetOpacity;
      }
  }
  if (this.completed && this.previewOpacity === 0) {
    return this.finish();
  } else {
    if (this.visible) {
      return this.draw();
    }
  }
}


PointPreviewSilk.prototype.setVisible = function (visible) {
  this.visible = visible;
}


PointPreviewSilk.prototype.setTargetOpacity = function (targetOpacity) {
  this.targetOpacity = targetOpacity;
}


PointPreviewSilk.prototype.fadeIn = function () {
  return this.targetOpacity = 1;
}


PointPreviewSilk.prototype.fadeOut = function () {
  return this.targetOpacity = 0;
}


PointPreviewSilk.prototype.fadeInFromZero = function () {
  this.previewOpacity = 0;
  return this.targetOpacity = 1;
}


PointPreviewSilk.prototype.fadeOutFromOne = function () {
  this.previewOpacity = 1;
  return this.targetOpacity = 0;
}


PointPreviewSilk.prototype.completeAndFadeOut = function () {
  this.complete();
  return this.fadeOut();
}


PointPreviewSilk.prototype.drawCurve = function (instr) {
  var fillStyle, p;
  p = this.curve[0];
  this.ctx.beginPath();
  fillStyle = this.ctx.fillStyle;
  this.ctx.fillStyle = '#4e4866';
  if (typeof this.previewEmphasisFn === "function" ? this.previewEmphasisFn(instr) : void 0) {
    this.ctx.fillStyle = '#ffffff';
  }
  this.ctx.arc(p.x, p.y, instr.scale * this.previewRadius, 0, 2 * Math.PI, false);
  this.ctx.fill();
  this.ctx.fillStyle = fillStyle;
  this.ctx.globalCompositeOperation = 'source-over';
  this.ctx.strokeWidth = 0.5;
  this.ctx.stroke();
  return this.ctx.closePath();
}


PointPreviewSilk.prototype.addPoint = function (x, y, vx, vy) {
  if (this.completed) {
    return;
  }
  return this.curve = [{
    x: x,
    y: y
  }];
}


PointPreviewSilk.prototype.setColor = function () {
  this.ctx.globalAlpha = this.previewOpacity;
  return this.ctx.globalCompositeOperation = this.globalCompositeOperation;
}


PointPreviewSilk.prototype.serialize = function () {
  var state;
  state = PointPreviewSilk.__super__.serialize.call(this);
  state.curve = [];
  return state;
}

export default PointPreviewSilk
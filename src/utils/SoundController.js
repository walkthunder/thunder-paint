
function SoundController(buffer, ctx) {
  this.buffer = buffer;
  this.ctx = ctx;
  this.setLoop(false);
  this.setVolume(1);
}

SoundController.prototype.setLoop = function (loop) {
  this.loop = loop;
}
  ;

SoundController.prototype.setVolume = function (gain) {
  this.gain = gain;
}
  ;

SoundController.prototype.createSource = function () {
  this.source = this.ctx.createBufferSource();
  this.source.buffer = this.buffer;
  this.source.loop = this.loop;
  this.source.gain.value = this.gain;
  return this.source.connect(this.ctx.destination);
}
  ;

SoundController.prototype.play = function () {
  var _ref1;
  return (_ref1 = this.source) != null ? _ref1.noteOn(0) : void 0;
}
  ;

SoundController.prototype.fadeTo = function (gain, duration) {
  var now;
  this.gain = gain;
  now = this.ctx.currentTime;
  this.source.gain.cancelScheduledValues(now);
  this.source.gain.setValueAtTime(this.source.gain.value, now);
  return this.source.gain.linearRampToValueAtTime(this.gain, now + duration);
}
  ;

SoundController.prototype.trigger = function (multiplier) {
  var backup, _ref1;
  if (multiplier == null) {
    multiplier = 1;
  }
  backup = this.triggerSource;
  this.triggerSource = this.triggerSourceBk;
  this.triggerSourceBk = backup;
  if ((_ref1 = this.triggerSource) != null) {
    _ref1.noteOff(0);
  }
  this.triggerSource = this.ctx.createBufferSource();
  this.triggerSource.buffer = this.buffer;
  this.triggerSource.loop = this.loop;
  this.triggerSource.gain.value = this.gain * multiplier;
  this.triggerSource.connect(this.ctx.destination);
  return this.triggerSource.noteOn(0);
}

export default SoundController
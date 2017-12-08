
function Recorder(target) {
  this.target = target;
  this.recTape = new Tape(this.target, true);
  this.playTape = new Tape(this.target);
  this.rec = this.recTape.rec;
  this.get = this.recTape.get;
}

Recorder.prototype.frame = function () {
  this.recTape.frame();
  return this.playTape.frame();
}
  ;

Recorder.prototype.play = function (tape) {
  if (tape != null) {
    this.recTape.eject();
    this.playTape.load(tape);
  }
  return this.playTape.play();
}
  ;

Recorder.prototype.stopPlaying = function () {
  return this.playTape.stop();
}
  ;

Recorder.prototype.startRecording = function () {
  return this.recTape.play();
}
  ;

Recorder.prototype.stopRecording = function () {
  return this.recTape.stop();
}
  ;

Recorder.prototype.ejectAll = function () {
  this.playTape.eject();
  return this.recTape.eject();
}
  ;

Recorder.prototype.serialize = function () {
  return {
    recTape: this.recTape.serialize(),
    playTape: this.playTape.serialize()
  };
}
  ;

Recorder.prototype.unserialize = function (data) {
  this.recTape.unserialize(data.recTape);
  return this.playTape.unserialize(data.playTape);
}
export default Recorder
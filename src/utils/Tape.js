import { __bind, __slice } from './helpers'

function Tape(target, recordOnly) {
  this.target = target;
  this.recordOnly = recordOnly != null ? recordOnly : false;
  this.unserialize = __bind(this.unserialize, this);
  this.serialize = __bind(this.serialize, this);
  this.eject = __bind(this.eject, this);
  this.get = __bind(this.get, this);
  this.rewind = __bind(this.rewind, this);
  this.fastforward = __bind(this.fastforward, this);
  this.stop = __bind(this.stop, this);
  this.play = __bind(this.play, this);
  this.load = __bind(this.load, this);
  this.frame = __bind(this.frame, this);
  this.rec = __bind(this.rec, this);
  this.tape = {};
  this.time = 0;
  this.playing = false;
}

Tape.prototype.rec = function () {
  var info, _base, _name;
  info = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
  if ((_base = this.tape)[_name = this.time] == null) {
    _base[_name] = [];
  }
  return this.tape[this.time].push(info);
}


Tape.prototype.frame = function () {
  var args, info, name, _i, _len, _ref1, _ref2;
  if (this.playing) {
    if (!this.recordOnly && this.time in this.tape) {
      _ref1 = this.tape[this.time];
      for (_i = 0,
        _len = _ref1.length; _i < _len; _i++) {
        info = _ref1[_i];
        name = info[0],
          args = 2 <= info.length ? __slice.call(info, 1) : [];
        (_ref2 = this.target[name]).call.apply(_ref2, [this.target].concat(__slice.call(args)));
      }
    }
    return this.time += 1;
  }
}


Tape.prototype.load = function (tape) {
  this.tape = tape;
  return this.rewind();
}


Tape.prototype.play = function () {
  return this.playing = true;
}


Tape.prototype.stop = function () {
  return this.playing = false;
}


Tape.prototype.fastforward = function (amount) {
  return this.time += amount;
}


Tape.prototype.rewind = function () {
  return this.time = 0;
}


Tape.prototype.get = function () {
  return this.tape;
}


Tape.prototype.eject = function () {
  var tape;
  tape = this.tape;
  this.load({});
  return tape;
}


Tape.prototype.serialize = function () {
  return {
    time: this.time,
    playing: this.playing,
    tape: { ...this.tape }
  };
}


Tape.prototype.unserialize = function (data) {
  return this.tape = data.tape,
    this.time = data.time,
    this.playing = data.playing,
    data;
}

export default Tape
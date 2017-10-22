const { Readable } = require('stream');
const isPromise = require('is-promise');
const isStream = require('is-stream');
const pipeInto = require('./util/pipe-into');
const toString = require('./util/to-string');

async function readAll(stream, strings, values) {
  let i = 0;
  while(i < values.length) {
    let html = strings[i];
    stream.push(html);

    let p = values[i];
    let val;
    if(isStream(p)) {
      await pipeInto(p, stream);
    } else {
      val = await p;
      stream.push(toString(val));
    }

    i++;
  }
  stream.push(strings[i]);
  stream.push(null);
}

exports.html = function(strings, ...values){
  let reading = false;

  let readable = new Readable({
    read() {
      if(reading) return;
      reading = true;
      readAll(this, strings, values).catch(err => {
        this.emit('error', err);
        this.push(null);
      });
    }
  });

  return readable;
};

exports.map = require('./map').map;
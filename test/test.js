const assert = require('assert');
const {html, map} = require('../lib/index');
const fs = require('fs');
const Readable = require('stream').Readable;
const { readAll } = require('./helpers');

describe('TextNodes', function(){
  it('basics works', async function(){
    function tmpl({name}) {
      return html`
        <span class="msg">Hello <strong>${name}</strong>!</span>
      `;
    }

    let expected = ['<span class="msg">Hello <strong>', 'World', '</strong>!</span>'];

    let values = await readAll(tmpl({
      name: Promise.resolve('World')
    }));

    assert.deepEqual(values, expected);
  });
});

describe('Attributes', function(){
  it('basics works', async function(){
    function tmpl({myClass, name}) {
      return html`
        <span class="${myClass}">Hello ${name}</span>
      `
    }

    let expected = [
      '<span class="',
      'blue',
      '">Hello',
      'Wilbur',
      '</span>'
    ];

    let values = await readAll(tmpl({
      myClass: Promise.resolve().then(_ => 'blue'),
      name: 'Wilbur'
    }));

    assert.deepEqual(values, expected);
  });
});

describe('Lists', function(){
  it('basics works', async function() {
    function tmpl({items}) {
      return html`
        <ul>
          ${map(items, item => {
            return html`<li>Item ${item}</li>`
          })}
        </ul>
      `;
    }

    function arrStream(arr) {
      return Readable({
        objectMode: true,

        read(){
          if(arr.length) {
            this.push(arr.shift());
          } else {
            this.push(null);
          }
        }
      });
    }

    let values = await readAll(tmpl({
      items: arrStream([1, 2, 3])
    }));

    let expected = [
      '<ul>',
      '<li>Item',
      '1',
      '</li>',
      '<li>Item',
      '2',
      '</li>',
      '<li>Item',
      '3',
      '</li>',
      '</ul>'
    ];

    assert.deepEqual(values, expected);
  });
});

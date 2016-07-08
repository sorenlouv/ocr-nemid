'use strict';

const bp = require('bluebird');
const tesseractProcess = bp.promisify(require('node-tesseract').process);
const _ = require('lodash');

function parseOcrText(ocrText) {
  let rows = ocrText.split('\n')  // Split on linebreak
  .filter(row => row.length > 44) // Remove short lines
  .map(row => row.split(' '))     // Split on space

  // Remove short codes on rows with more than 8 codes
  .map(row => {
    if (row.length > 8) {
      return row.filter(line => line.length >= 4);
    }
    return row;
  })

  // Remove everything but digits
  .map(row => {
    return row.map(line => line.replace(/[^0-9]/, ''));
  })

  // split long codes into multiple
  .map(row => {
    return row.map((line, i) => {
      let isEven = i % 2 === 0;
      if (line.length === 10) {
        if (isEven) {
          return [line.slice(0, 4), line.slice(4, 10)];
        } else {
          return [line.slice(0, 6), line.slice(6, 10)];
        }
      }
      return line;
    });
  })

  // Remove trailing "1" on some codes
  .map(row => {
    return row.map(line => {
      if (line.length === 7 && _.last(line) === '1') {
        return line.slice(0, 6);
      }
      return line;
    });
  });

  return _(rows).flattenDeep().chunk(2).sortBy('[0]').value();
}

function getCodes(filename) {
  let options = {
    tessedit_write_images: true,
    // l: 'deu',
    // config: 'digits',
    psm: 4,
    binary: '/usr/local/bin/tesseract'
  };

  return tesseractProcess(filename, options)
    .then(function(ocrText) {
      return parseOcrText(ocrText);
    });
}

module.exports = {
  getCodes: getCodes,
  parseOcrText: parseOcrText
};

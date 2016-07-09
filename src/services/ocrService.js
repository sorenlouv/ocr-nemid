'use strict';

const _ = require('lodash');
const path = require('path');
const bp = require('bluebird');
const tesseractProcess = bp.promisify(require('node-tesseract').process);
const fs = bp.promisifyAll(require('fs'));

const TMP_FOLDER = path.resolve(__dirname, '..', '..', 'tmp');
const CARD_IMAGE_PATH = path.resolve(TMP_FOLDER, 'card.jpg');
const CARD_TEXT_FILE = path.resolve(TMP_FOLDER, 'card.json');

let service = {};

service.parseOcrText = function(ocrText) {
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
};

service.getCodesFromImage = function() {
  let options = {
    tessedit_write_images: true,
    // l: 'deu',
    // config: 'digits',
    psm: 4,
    binary: '/usr/local/bin/tesseract'
  };

  return tesseractProcess(CARD_IMAGE_PATH, options)
    .then(ocrText => service.parseOcrText(ocrText));
};

service.saveImage = function(binaryData) {
  return fs.writeFileAsync(CARD_IMAGE_PATH, binaryData, 'binary');
};

service.saveCodes = function(codes) {
  return fs.writeFileAsync(CARD_TEXT_FILE, JSON.stringify(codes), 'utf-8');
};

service.getCodes = function() {
  return fs.readFileAsync(CARD_TEXT_FILE, {encoding: 'utf-8'});
};

service.createTempFolder = function() {
  if (!fs.existsSync(TMP_FOLDER)){
    return fs.mkdirSync(TMP_FOLDER);
  }
};

// Save and process image, and return codes
service.save = function(binaryData) {
  service.createTempFolder();

  return service.saveImage(binaryData)
    .then(() => service.getCodesFromImage())
    .then(codes => {
      return service.saveCodes(codes).then(() => codes);
    });
};

module.exports = service;

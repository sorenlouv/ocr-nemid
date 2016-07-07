const React = require('react');
const bp = require('bluebird');
const fs = bp.promisifyAll(require('fs'));
const path = require('path');
const ocrService = require('../../services/ocrService');
const CodesTable = require('../codesTable/codesTable');

const IMAGE_FILE = path.resolve(__dirname, '..', '..', '..', 'temp', 'sorennemid.jpg');
const CODES_FILE = path.resolve(__dirname, '..', '..', '..', 'temp', 'sorennemid.json');

module.exports = React.createClass({
  getInitialState() {
    return {
      codes: []
    };
  },

  componentDidMount() {
    fs.readFileAsync(CODES_FILE, {encoding: 'utf-8'})
      .then(codes => {
        this.setState({codes: JSON.parse(codes)});
      });
  },

  onChangeFile(evt) {
    let file = evt.target.files[0];
    let reader = new FileReader();

    reader.onload = function(evt) {
      let binaryFile = evt.target.result;
      fs.writeFileAsync(IMAGE_FILE, binaryFile, 'binary')
        .then(() => ocrService.getCodes(IMAGE_FILE))
        .then(codes => {
          return fs.writeFileAsync(CODES_FILE, JSON.stringify(codes), 'utf-8');
        })
        .then(() => {
          console.log('done');
        })
        .catch(err => {
          console.error(err);
        });
    };

    reader.readAsBinaryString(file);
  },

  render() {
    return (
       <div>
           <input type="file" onChange={this.onChangeFile}></input>
           <CodesTable codes={this.state.codes}></CodesTable>
       </div>
    );
  }
});

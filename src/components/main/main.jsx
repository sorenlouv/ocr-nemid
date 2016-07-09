const React = require('react');
const _ = require('lodash');
const ocrService = require('../../services/ocrService');
const CodesTable = require('../codesTable/codesTable');

module.exports = React.createClass({
  getInitialState() {
    return {
      codes: [],
      isUploading: false,
      loadingText: '',
      loadingTime: 0
    };
  },

  componentDidMount() {
    ocrService.getCodes()
      .then(codes => {
        this.setState({codes: JSON.parse(codes)});
      })
      .catch(function() {
        console.log('No code file was found');
      });
  },

  loadingStart() {
    this.setState({isUploading: true});
    let id = setInterval(() => {
      this.state.loadingTime = this.state.loadingTime > 4 ? 0 : ++this.state.loadingTime;
      this.setState({loadingTime: this.state.loadingTime});
    }, 200);

    return () => {
      this.setState({isUploading: false});
      clearInterval(id);
    };
  },

  getLoadingText() {
    let words = ['uploading', 'uploading.', 'uploading..', 'uploading...', 'uploading....', 'uploading.....'];
    return words[this.state.loadingTime];
  },

  onChangeFile(evt) {
    var that = this;
    let file = evt.target.files[0];
    let reader = new FileReader();

    reader.onload = function(evt) {
      let binaryData = evt.target.result;
      let loadingStop = that.loadingStart();

      ocrService.save(binaryData)
        .then(codes => {
          that.setState({codes: codes});
          new Notification('Your card was saved', {
            body: codes.length + ' codes were found'
          });
        })
        .catch(err => {
          new Notification('An error occured', {
            body: err
          });
        })
        .finally(loadingStop);
    };

    reader.readAsBinaryString(file);
  },

  onClickUpload() {
    document.querySelector('.upload-container input').click();
  },

  hasCodes() {
    return !_.isEmpty(this.state.codes);
  },

  getButtonText() {
    if (this.state.isUploading) {
      return this.getLoadingText();
    }
    return this.hasCodes() ? 'Replace NemId' : 'Upload NemId';
  },

  render() {
    let uploadInput = (
      <div className="upload-container" onClick={this.onClickUpload}>
        <span>{this.getButtonText()}</span>
        <input type="file" onChange={this.onChangeFile} accept=".gif,.jpg,.jpeg,.png"></input>
      </div>
    );
    let codesTable = <CodesTable codes={this.state.codes}></CodesTable>;

    return (
      <div className={'main-container ' + (!this.hasCodes() ? 'splash-screen' : '')}>
        {this.hasCodes() ? codesTable : ''}
        {uploadInput}
      </div>
    );
  }
});

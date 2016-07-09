const React = require('react');
const _ = require('lodash');
const {clipboard} = require('electron');

module.exports = React.createClass({
  getInitialState() {
    return {
      codeKey: ''
    };
  },

  onChangeCodeKey(evt) {
    this.setState({codeKey: evt.target.value});
  },

  componentWillUpdate(nextProps, nextState) {
    let nextCodeKey = nextState.codeKey;
    if (!nextCodeKey) {
      return;
    }

    let matchingCodes = this.getMatchingCodes(nextCodeKey);

    if(matchingCodes.length === 1) {
      clipboard.writeText(matchingCodes[0][1]);
      new Notification(matchingCodes[0][1], {
        body: 'was copied to your clipboard!'
      });
    }
  },

  getMatchingCodes(codeKey) {
    return this.props.codes.filter(code => _.startsWith(code[0], codeKey));
  },

  render() {
    let matchingCodes = this.getMatchingCodes(this.state.codeKey).slice(0, 5);

    let tableNode = (
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th><img className="key-icon" src="./img/key-icon.png"/></th>
          </tr>
        </thead>

        <tbody>
          {
              matchingCodes.map((code, i) => {
                return (
                  <tr key={i}>
                    <td className="key">{code[0]}</td>
                    <td>{code[1]}</td>
                  </tr>
                );
              })
          }
        </tbody>
      </table>
    );

    return (
      <div className="codes-table-container">
        <input className="search" placeholder="Search..." type="number" maxLength="4" autoFocus onChange={this.onChangeCodeKey}></input>
        {_.isEmpty(matchingCodes) ? <p>No matches</p> : tableNode}
      </div>
    );
  }
});

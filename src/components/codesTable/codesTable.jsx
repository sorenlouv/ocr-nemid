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

    if (nextCodeKey.length === 4) {
      let code = _.find(this.props.codes, code => {
        return code[0] === nextCodeKey;
      });

      if (code) {
        clipboard.writeText(code[1]);
        new Notification(code[1], {
          body: 'was copied to your clipboard!'
        });
      }
    }
  },

  render() {
    var displayCodes = this.props.codes.filter(code => _.startsWith(code[0], this.state.codeKey));
    displayCodes = displayCodes.slice(0, 5);

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
              displayCodes.map((code, i) => {
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
        <input className="search" placeholder="Search..." type="text" maxLength="4" autoFocus onChange={this.onChangeCodeKey}></input>
        {_.isEmpty(displayCodes) ? <p>No matches</p> : tableNode}
      </div>
    );
  }
});

const React = require('react');
const _ = require('lodash');
const {clipboard} = require('electron');

module.exports = React.createClass({
  getInitialState() {
    return {
      codeKey: ''
    };
  },

  componentDidMount() {},

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
    displayCodes = displayCodes.slice(0, 25);

    return (
      <div>
        <input type="text" onChange={this.onChangeCodeKey}></input>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
            </tr>
          </thead>

          <tbody>
            {
                displayCodes.map((code, i) => {
                  return (
                    <tr key={i}>
                      <td>{code[0]}</td>
                      <td>{code[1]}</td>
                    </tr>
                  );
                })
            }
          </tbody>
        </table>
      </div>
    );
  }
});

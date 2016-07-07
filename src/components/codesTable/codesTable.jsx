const React = require('react');
const _ = require('lodash');
const path = require('path');
const {clipboard} = require('electron');

module.exports = React.createClass({
  getInitialState() {
    return {};
  },

  componentDidMount() {},

  componentWillReceiveProps(nextProps) {
    let nextCodeKey = nextProps.codeKey;
    if (!nextCodeKey) {
      return;
    }

    if (nextCodeKey.length === 4) {
      let code = _.find(this.props.codes, code => {
        return code[0] === nextCodeKey;
      });
      clipboard.writeText(code[1]);
      new Notification(code[1], {
        body: 'was copied to your clipboard!'
      });
    }
  },

  render() {
    return (
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
          </tr>
        </thead>

        <tbody>
          {
            this.props.codes
            .filter(code => _.startsWith(code[0], this.props.codeKey))
            .map((code, i) => {
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
    );
  }
});

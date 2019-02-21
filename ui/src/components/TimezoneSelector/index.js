import React, { PureComponent, PropTypes } from 'react';
import moment from 'moment-timezone';

const options = moment.tz.names().map(v => (
  <option key={v} value={v}>{`${v} (${moment().tz(v).format('Z')})`}</option>
))

/**
 * Timezone Selector
 *
 * @props {string} value - timezone database name e.g. "Europe/London", "Asia/Tokyo"
 * @props {(timezone: string) => void} onChange
 */
export default class TimezoneSelector extends PureComponent {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
  };

  render = () => {
    const { value, onChange } = this.props;
    return (
      <select
        className="form-control"
        value={value}
        onChange={e => onChange(e.target.value)} >
        {options}
      </select>
    );
  };
}

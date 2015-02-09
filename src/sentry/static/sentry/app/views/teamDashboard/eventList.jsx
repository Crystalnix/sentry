/*** @jsx React.DOM */

var React = require("react");

var api = require("../../api");
var Count = require("../../components/count");
var LoadingError = require("../../components/loadingError");
var LoadingIndicator = require("../../components/loadingIndicator");
var PropTypes = require("../../proptypes");

var EventNode = React.createClass({
  propTypes: {
    group: PropTypes.Group.isRequired
  },

  render() {
    var group = this.props.group;

    return (
      <li>
        <div className="dashboard-count">
          <Count value={group.count} />
        </div>
        <div className="dashboard-details">
          <h3><a>{group.title}</a></h3>
          <p className="message">{group.culprit}</p>
          <p className="time"><span>First:</span> <time time-since="group.firstSeen"></time>. <span>Last:</span> <time time-since="group.lastSeen"></time>.</p>
        </div>
      </li>
    );
  }
});

var EventList = React.createClass({
  propTypes: {
    title: React.PropTypes.string.isRequired,
    endpoint: React.PropTypes.string.isRequired
  },

  getInitialState() {
    return {
      groupList: [],
      loading: true,
      error: false,
      statsPeriod: "24h"
    };
  },

  componentWillMount() {
    this.fetchData();
  },

  componentDidUpdate(_, prevState) {
    if (this.state.statsPeriod != prevState.statsPeriod) {
      this.fetchData();
    }
  },

  fetchData() {
    this.setState({
      loading: true,
      error: false
    });

    var minutes;
    switch(this.state.statsPeriod) {
      case "15m":
        minutes = "15";
        break;
      case "60m":
        minutes = "60";
        break;
      case "24h":
        minutes = "1440";
        break;
    }

    api.request(this.props.endpoint, {
      query: {
        limit: 5,
        minutes: minutes
      },
      success: (data) => {
        this.setState({
          groupList: data,
          loading: false,
          error: false
        });
      },
      error: () => {
        this.setState({
          loading: false,
          error: true
        });
      }
    });
  },

  onSelectStatsPeriod(period) {
    this.setState({
      statsPeriod: period
    });
  },

  render() {
    var eventNodes = this.state.groupList.map((item) => {
      return <EventNode group={item} key={item.id} />;
    });

    return (
      <div className="box">
        <div className="box-header clearfix">
          <h3 className="pull-left">{this.props.title}</h3>
          <ul className="nav nav-pills nav-small pull-right">
            <li className={this.state.statsPeriod === "15m" && "active"}>
              <a onClick={this.onSelectStatsPeriod.bind(this, '15m')}>
                15 minutes
              </a>
            </li>
            <li className={this.state.statsPeriod === "60m" && "active"}>
              <a onClick={this.onSelectStatsPeriod.bind(this, '60m')}>
                60 minutes
              </a>
            </li>
            <li className={this.state.statsPeriod === "24h" && "active"}>
              <a onClick={this.onSelectStatsPeriod.bind(this, '24h')}>
                24 hours
              </a>
            </li>
          </ul>
        </div>
        <div className="box-content">
          <div className="tab-pane active">
            {this.state.loading ?
              <LoadingIndicator />
            : (this.state.error ?
              <LoadingError onRetry={this.fetchData} />
            : (eventNodes.length ?
              <ul className="dashboard-events">
                {eventNodes}
              </ul>
            :
              <div className="alert alert-block alert-info">No data available.</div>
            ))}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = EventList;
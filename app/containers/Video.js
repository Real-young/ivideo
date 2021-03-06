// @flow
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { webview } from 'electron';

import Channel from './Channel';
import ToolBar from './ToolBar';
import * as sourceActions from '../actions/source';

class VideoPlay extends PureComponent < Props > {
  constructor(props) {
    super(props);
    this.handleSwitchChannel = this.handleSwitchChannel.bind(this);
    this.onComeback = this.onComeback.bind(this);
    this.onSourceSelected = this.onSourceSelected.bind(this);
    this.onSwitchSource = this.onSwitchSource.bind(this);
  }
  state = {
    channel: [],
    url: 'https://v.qq.com',
    freeUrl: [],
    selectedUrl: 'http://vip.jlsprh.com/index.php?url=',
  }
  componentDidMount() {
    this.props.actions.getAllVideoSource();
    const webview = this.webview;
    webview.addEventListener('dom-ready', () => {
      this.setTitle();
    });
    webview.addEventListener('new-window', (obj) => {
      const { freeUrl } = this.state;
      this.setState({
        url: `${obj.url}`
      });
    });
    webview.addEventListener('will-navigate', (obj) => {
      this.setState({
        url: `${obj.url}`
      });
    });
  }
  componentWillReceiveProps(nextProps) {
    const { source } = nextProps;
    if(source) {
      this.setState({
        channel: source.platformlist,
        freeUrl: source.list
      });
    }
  }
  handleSwitchChannel(value) {
    this.setState({
      url: value.key
    });
  }
  setTitle() {
    const title = this.webview.getTitle();   
    this.setState({
      title,
    }); 
  }
  onComeback() {
    this.webview.goBack();
  }
  onSourceSelected(value) {
    const selectedUrl = this.state.freeUrl.find(d => {
      if (d.name === value) {
        return d.url;
      }
    })
    this.setState({
      selectedUrl,
    });
  }
  onSwitchSource() {
    const { selectedUrl } = this.state;
    const currentVideoUrl = this.webview.getURL();
    this.setState({
      url: `${selectedUrl.url}${currentVideoUrl}`
    });
  }
  render() {
    const { channel, url, freeUrl, title } = this.state;
    return (
      <div style={{ display: 'flex' }}>
        <div style={{ width: '200px' }}>
          <Channel
            channel={channel}
            handleSwitchChannel={this.handleSwitchChannel}
          />
        </div>
        <div style={{ height: '100vh', width: 'calc(100vw - 200px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: '60px' }}>
            <ToolBar
              onComeback={this.onComeback}
              onSourceSelected={this.onSourceSelected}
              onSwitchSource={this.onSwitchSource}              
              freeUrl={freeUrl}
              title={title}
            />
          </div>
          <webview
            ref={ (webview) => {this.webview = webview} }
            title="腾讯视频"
            style={{ height: 'calc(100vh - 60px)', width: '100%' }}
            src={url}
            allowpopups="true"
          >
          </webview>
        </div>
      </div>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      ...bindActionCreators(sourceActions, dispatch),
    },
  }
}
function mapStateToProps(state) {
  return {
    source: state.source    
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(VideoPlay);

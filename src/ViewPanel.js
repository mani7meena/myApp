import React, { Component } from 'react';
import tasks from './tasks1.json';
import './App.css';
class ViewPanel extends Component {
  constructor(props) {
    super();
  }
  render() {
    let contenta="";
    contenta = tasks[this.props.curTask].instructions;
    return <div dangerouslySetInnerHTML={{__html: contenta}}>
            
        </div>
  }
}
export default ViewPanel;

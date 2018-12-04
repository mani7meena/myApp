import React, { Component } from 'react';
import sampleTasks from './tasks1.json';
import logo from './logo.svg';
import './App.css';
//import { Container,Row,Col,ButtonGroup,Button,ListGroup } from 'react-bootstrap';
//import ViewPanel from './ViewPanel.js'

import classnames from 'classnames';
import Prism from 'prismjs';
import "./prism.css";
import { HtmlRenderer, Parser } from 'commonmark';
import { 
    Container,Row,Col,Jumbotron,
    TabContent, TabPane,Nav, NavItem, NavLink,
    Dropdown, DropdownItem, DropdownToggle, DropdownMenu, 
    Alert,Progress,
    ButtonGroup,Button,
    Form, FormGroup, Label, Input,
} from 'reactstrap';
import 'whatwg-fetch';
import config from './config.js';
import moment from 'moment';

class App extends Component {
  constructor(props) {
    super(props);
    
    this.state={
      //tasks:sampleTasks,
      curTask:0,
      mode:"view",
      activeTab: 0,
      tasks:[],
      loadingTasks: false,
      addForm:false,
      error:'',
      success:false,
      deleteError:'',
      deleteSuccess:false,
      taskName:'',
      dueDate:'',
      dueTime:'00:00',
      status:'Open',
      instructions:'',
      editMode:false
    }
    
    this.toggle = this.toggle.bind(this);
    this.showAddForm = this.showAddForm.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    
  }

  componentDidMount() {
    Prism.highlightAll();
    
    this.setState({ loadingTasks:true});

    let url = config.API_URL+'tasks';
    fetch(url,{}).then(res => res.json())
    .then(json => {
      console.log('enter',json);
      this.setState({
        tasks: json.tasks,
        loadingTasks:false
      });
    }, error =>{
      this.setState({ loadingTasks:false});
      console.log('err',error);
    });
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }
  
  showAddForm(){
    this.setState({
      addForm: !this.state.addForm,
      editMode:false,
      taskName:'',
      dueDate:'',
      dueTime:'00:00',
      status:'Open',
      instructions:'',
    });
  }

  openEditModal (data) {
    let dueDate = moment(data.due).utc().format('YYYY-MM-DD');
    let dueTime = moment(data.due).utc().format('HH:mm');
    
    this.setState({
       addForm: !this.state.addForm,
       editMode:true,
       taskName:data["task-name"],
       status:data.status,
       dueDate:dueDate,
       dueTime:dueTime,
       instructions:data.instructions
    });
  }  

  handleChange (evt) {
    this.setState({ [evt.target.name]: evt.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();  
    let method = 'POST';
    let url = config.API_URL+'tasks/';
    if(this.state.editMode){
      method = 'PUT';
      url = config.API_URL+'tasks/'+this.state.taskName;
    }
    
    this.setState({
      error: '',
      success:false
    });  
    fetch(url, { 
        method: method,
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          'task-name': this.state.taskName,
          'due': this.state.dueDate+'T'+this.state.dueTime+':00.000Z',
          //+' '+this.state.dueTime,
          'status': this.state.status,
          'instructions': this.state.instructions,
        }) 
    })
    .then(res => res.json())
    .then(json => {
      console.log('res',json);
      if(json.error !== undefined && json.error !== ''){
        console.log('error',json.error);
        this.setState({
          error: json.error  
        });  
      }
      else if(json._id !== undefined && json._id !== ''){
        let elements = this.state.tasks.slice();
        if(!this.state.editMode){
          elements.push({
            'task-name': this.state.taskName,
            'due': this.state.dueDate+'T'+this.state.dueTime+':00.000Z',
            'status': this.state.status,
            'instructions': this.state.instructions
          });
        }else{
            
          // this.state.tasks.map(task => {
          //     if(task["task-name"] === this.state.taskName) {
          //         //console.log('enter');
          //         return (
          //               { 
          //               "task-name": this.state.taskName,
          //               due: this.state.dueDate+'T'+this.state.dueTime+':00.000Z',
          //               status: this.state.status,
          //               instructions: this.state.instructions
          //             }
          //         )
          //     }
          // });
          let ele = this.state.tasks.filter((task) => {
            return this.state.taskName !== task["task-name"];
          });  
          ele.push({ 
            "task-name": this.state.taskName,
            due: this.state.dueDate+'T'+this.state.dueTime+':00.000Z',
            status: this.state.status,
            instructions: this.state.instructions
          })
          elements = ele;
          console.log(this.state.tasks);
        }  
        this.setState({
          success: true,
          addForm:false,
          tasks:elements
        });
      }
      else{
        this.setState({
          error: 'Request Error!'
        });  
      }
    }, error =>{
      // this.setState({
      //   error: error  
      // });
      console.log('err',error);
      this.setState({
        error: 'Network error!'
      });
    });
  }

  handleDelete(data) {
    console.log(data);
    let method = 'DELETE';
    let url = config.API_URL+'tasks/'+data["task-name"];
    
    this.setState({
      error: '',
      success:false
    });  
    fetch(url, { 
        method: method,
        headers: {'Content-Type':'application/json'},
        //body: JSON.stringify({ }) 
    })
    .then(res => res.json())
    .then(json => {
      if(json.success){
        let tasks = this.state.tasks.filter((task) => {
          return data["task-name"] !== task["task-name"];
        });
      
        this.setState(state => {
            state.tasks = tasks;
            state.deleteSuccess= true;
            return state;
        });
      }
      else{
        this.setState({
          deleteError: 'Request Error!'
        });  
      }
    }, error =>{
      // this.setState({
      //   error: error  
      // });
      console.log('err',error);
      this.setState({
        deleteError: 'Network error!'
      });
    });
  }

  render() {
    //let curTask = this.state.tasks[this.state.activeTab];
    //let curIns = this.state.tasks[this.state.activeTab].instructions;
    let that=this;
    let listItems=this.state.tasks.map(function(item,i){
      return(
        <NavItem key={i}>
          <NavLink
            className={classnames({ active: that.state.activeTab === i })}
            onClick={() => { that.toggle(i); }}
          >
            {item["task-name"]}
          </NavLink>
        </NavItem>
      );
    })
    
    let parser = new Parser()
    let renderer = new HtmlRenderer()
    
    let currentIns = renderer.render(parser.parse(this.state.instructions));
    let synHtml = Prism.highlight(currentIns, Prism.languages.markup, 'markup');

    let listTabs=this.state.tasks.map(function(item,i){
      let ins = renderer.render(parser.parse(item.instructions));
      let active = '';
      if(i===that.state.activeTab){
        active = 'active';
      }else{
        active = '';
      }
      let dueDate = moment(item.due).utc().format('dddd, MMMM Do YYYY, hh:mm A');
      
      return(
        <TabContent key={i} vertical activeTab="{this.state.activeTab}">
        <TabPane tabId="{i}" className={active}>
          <Row>
            <Col sm="12">
            <pre>
            <code >
            {/* {curTask.instructions} */}
            <div dangerouslySetInnerHTML={{__html: ins}}></div>
            </code>
            </pre>
            Status: {item.status}, Due: {dueDate}
            
              {/* <h4>{curTask.instructions}</h4> */}
            </Col>
            <Col sm="12">
              <ButtonGroup>
                <Button color="primary" onClick={() => { that.showAddForm(); }}>Add</Button>
                <Button color="primary" onClick={that.openEditModal.bind(that, item)}>Update</Button>
                <Button color="primary" onClick={that.handleDelete.bind(that, item)}>Delete</Button>
              </ButtonGroup>
            </Col>
          </Row>
        </TabPane>
        </TabContent>
    );
  })

    return(
        <Container>
          <Container><h1 className="text-center">Title here</h1></Container>
          {this.state.success && <Alert color="success">Successfully Added</Alert>} 
          {this.state.deleteError !== '' && <Alert color="warning">Error: {this.state.deleteError}</Alert>}
          {this.state.deleteSuccess && <Alert color="success">Successfully Deleted</Alert>}  

          { this.state.addForm ?
          <div>
            <Row>
            <Col sm="6">
            <Form onSubmit={this.handleSubmit}>
              <FormGroup row>
                <Label for="taskName" sm={3}>Name</Label>
                <Col sm={5}>
                  <Input disabled={this.state.editMode} value={this.state.taskName} onChange={this.handleChange} type="text" name="taskName" id="taskName" placeholder="Enter task name" required/>
                </Col>
                <Col sm="4">
                <Input value={this.state.status} onChange={this.handleChange} type="select" name="status" id="status">
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </Input>
                </Col>
              </FormGroup>
              <FormGroup row>
                <Label for="dueDate" sm={3}>Due</Label>
                <Col sm={5}>
                  <Input value={this.state.dueDate} onChange={this.handleChange} type="date" name="dueDate" id="dueDate" placeholder="Enter due date" required />
                </Col>
                <Col sm="4">
                  <Input value={this.state.dueTime} onChange={this.handleChange}  type="time" name="dueTime" id="dueTime" placeholder="Enter due time" required />
                </Col>                
              </FormGroup>
              {/* <FormGroup tag="fieldset" row>
                <Label for="status" sm={3}>Status</Label>
                <Col sm={9}>
                  <Input value={this.state.status} onChange={this.handleChange} type="select" name="status" id="status">
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </Input>
              </Col>
              </FormGroup> */}
              <FormGroup row>
                {/* <Label for="instructions" sm={3}>Instructions</Label> */}
                <Col sm={12}>
                  <Input rows={10} value={this.state.instructions} onChange={this.handleChange} type="textarea" name="instructions" id="instructions" required />
                </Col>
              </FormGroup>
              {this.state.error !== '' && <Alert color="warning">Error: {this.state.error}</Alert>}
              {/* {this.state.success && <Alert color="success">Successfully Added</Alert>}   */}
              <FormGroup check row>
                <ButtonGroup>
                  <Button color="primary" >Commit</Button>
                  <Button color="primary" onClick={this.showAddForm}>Cancel</Button>
                </ButtonGroup>
              </FormGroup>
            </Form>
            </Col>
            <Col sm="6">
              <div>
                <pre>
                  <code className="language-markup">
                  <div dangerouslySetInnerHTML={{__html: synHtml}}></div>
                  </code>
                </pre>
              </div>
            </Col>
            </Row>
          </div>
          :
           
          <div>
          {/* { this.state.loadingTasks && 
            <Progress animated color="warning" value="100" />
          }
          
          { listItems && listItems.length == 0 &&
            <Alert color="warning" className="text-center">No results found</Alert>
          } */}

          { listItems && listItems.length > 0 &&
            <Row>
            <Col sm="3">
              <Nav vertical pills>
                {listItems}
              </Nav>
            </Col>
            <Col sm="9">
              <Jumbotron>
                {listTabs}
              </Jumbotron>
            </Col>
            </Row>}
            </div>
          }
        </Container>

        
    );
  }

}

export default App;

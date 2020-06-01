import React, { Component } from 'react';
import './App.css';
import Home from './Home';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import EventList from './EventList';
import ParticipationForm from './ParticipationForm'


class App extends Component {
  render() {
    return (
        <Router>
          <Switch>
            <Route path='/' exact={true} component={Home}/>
            <Route path='/events' exact={true} component={EventList}/>
            <Route path='/participe/:idevent' exact={true} component={ParticipationForm}/>
          </Switch>
        </Router>
    )
  }
}

export default App;

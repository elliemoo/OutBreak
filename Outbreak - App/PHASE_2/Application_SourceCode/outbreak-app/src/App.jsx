import React from 'react';
import './App.css';
import {
  BrowserRouter as Router, Route, Switch,
} from 'react-router-dom';
import HomePage from './containers/HomePage';
import PrePage from './containers/PrePage';
import PostPage from './containers/PostPage'
import UserContext, { UserInputContext } from './utils/context'




function App() {
  const input = UserContext();
  return (
    <div className="App">
      <UserInputContext.Provider value={input}>
        <Router>
          <Switch>
            <Route exact path="/">
              <HomePage />
            </Route>
            <Route exact path="/pre">
              <PrePage />
            </Route>
            <Route exact path="/post">
              <PostPage />
            </Route>
          </Switch>
        </Router>
      </UserInputContext.Provider>
    </div>
  );
}

export default App;

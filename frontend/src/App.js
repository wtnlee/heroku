import React, { Component } from 'react';
import {BrowserRouter, Route, Redirect, Switch} from 'react-router-dom';

import AuthPage from './pages/Auth'
import NewsfeedPage from './pages/Newsfeed'
import MainNavigation from "./components/Navigation/MainNavigation"

import AuthContext from './context/auth-context'

import './App.css';

class App extends Component {
  state = {
    token: null,
    userId: null
  };

  login = (token, userId, tokenExpiration) => {
    this.setState({ token: token, userId: userId });
  };

  logout = () => {
    this.setState({ token: null, userId: null });
  };

  render() {
    return (
      <BrowserRouter>
        <React.Fragment>
          <AuthContext.Provider
            value={{
              token: this.state.token,
              userId: this.state.userId,
              login: this.login,
              logout: this.logout
            }}
          >
          <MainNavigation />
          <main>
            <Switch>
            {!this.state.token && <Redirect from="/" to="/auth" exact />}
            {this.state.token && <Redirect from="/" to="/newsfeed" exact />}
            {this.state.token && <Redirect from="/auth" to="/newsfeed" exact />}
            {!this.state.token && (
            <Route path="/auth" component={AuthPage} />
            )}
            <Route path="/newsfeed" component={NewsfeedPage} />
            {this.state.token && (
            <Route path="/newsfeed" component={NewsfeedPage} />
            )}
            </Switch>
          </main>
          </AuthContext.Provider>
        </React.Fragment>
      </BrowserRouter>
    );
  }
}

export default App;

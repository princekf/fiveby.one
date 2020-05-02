import React from "react";
import { Route, BrowserRouter as Router, Switch, Redirect } from "react-router-dom";
import "./App.scss";
import LoginPage from "./components/login/LoginPage";
import { isSessionValid, clearSession } from "./session";
import HomeContainer from "./components/home/HomeContainer";
import { Modal, Spin } from "antd";
import LoginForm from "./components/login/LoginForm";
import TestContainer from "./components/test/Test";

export interface AppState {
  email: string;
  password: string;
  data: App.Item[];
  error: string;
  isPageLoading: boolean;
  isSessionValid: boolean;
  isFirstTime: boolean;
}

class App extends React.Component<{}, AppState> {
  public state = {
    email: "",
    password: "",
    isPageLoading: true,
    data: [],
    error: "",
    isSessionValid: false,
    isFirstTime: true,
  };

  public componentDidMount() {
    const isSvalid = isSessionValid();
    this.setState({ isSessionValid: isSvalid, isPageLoading: false });
    if (isSvalid) {
      this.setState({ isFirstTime: false });
    }
    setInterval(this.checkSession, 10 * 1000);
  }

  public render() {
    if (this.state.isPageLoading) {
      return (
        <div className="loading-spin">
          <Spin size="large" />
        </div>
      );
    }
    if (!this.state.isSessionValid && this.state.isFirstTime) {
      return (
        <Router>
          <Switch>
            <Route exact={true} path="/login">
              <LoginPage />
            </Route>
          </Switch>
          <Redirect to="/login" push={true} />
        </Router>
      );
    }
    return (
      <>
        <Modal
          title="Please login to continue..."
          visible={!this.state.isSessionValid}
          closable={false}
          destroyOnClose={true}
          footer={null}
        >
          <LoginForm authSuccessHandler={this.handleAuthScess} />
        </Modal>
        <Router>
          <Switch>
            <Route exact={true} path="/login">
              <LoginPage />
            </Route>
            <Route path="/">
              <HomeContainer />
            </Route>
            <Route path="/test" exact={true}>
              <TestContainer />
            </Route>
          </Switch>
        </Router>
      </>
    );
  }

  private logout = (): void => {
    clearSession();
  };

  private checkSession = (): void => {
    if (window.location.pathname !== "/login" && !isSessionValid()) {
      this.setState({ isSessionValid: false });
    }
  };

  private handleAuthScess = (): void => {
    this.setState({ isSessionValid: isSessionValid(), isFirstTime: false });
  };
}

export default App;

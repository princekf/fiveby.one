import axios from "axios";
import React from "react";
import { Route, Redirect, BrowserRouter as Router, Switch } from 'react-router-dom';
import "./App.css";
import LoginForm from "./components/login/LoginForm"
import { isSessionValid, clearSession, getAuthHeaders } from "./session";
import HomeContainer from "./components/home/HomeContainer";

export interface AppState {
  email: string;
  password: string;
  isRequesting: boolean;
  isLoggedIn: boolean;
  data: App.Item[];
  error: string;
}

class App extends React.Component<{}, AppState> {
  public state = {
    email: "",
    password: "",
    isRequesting: false,
    isLoggedIn: false,
    data: [],
    error: "",
  };

  public componentDidMount() {
    this.setState({ isLoggedIn: isSessionValid() });
  }

  public render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/login">
            <LoginForm></LoginForm>
          </Route>
          <Route path="/home" >
            <HomeContainer />  
          </Route>
        </Switch>
        {/*this.state.isLoggedIn ?
        <Redirect
              to={{
                pathname: "/home",
              }}
            />
            :
            <Redirect
              to={{
                pathname: "/login",
              }}
            />*/
            }
        </Router>
      // <div className="App">

      //   <div className="App-error">{this.state.error}</div>
      //   {this.state.isLoggedIn ? (
      //     <div className="App-private">
      //       <div>
      //         Server test data:
      //         <ul>
      //           {this.state.data.map((item: App.Item, index) => (
      //             <li key={index}>
      //               name: {item.name} / value: {item.value}
      //             </li>
      //           ))}
      //         </ul>
      //       </div>
      //       <button disabled={this.state.isRequesting} onClick={this.getTestData}>
      //         Get test data
      //       </button>
      //       <button disabled={this.state.isRequesting} onClick={this.logout}>
      //         Log out
      //       </button>
      //     </div>
      //   ) : (
      //         <LoginForm />

      //     )}
      // </div>
    );
  }
  

  private logout = (): void => {
    clearSession();
    this.setState({ isLoggedIn: false });
  };

  private getTestData = async (): Promise<void> => {
    try {
      this.setState({ error: "" });
      const response = await axios.get<App.Item[]>("/api/items", { headers: getAuthHeaders() });
      this.setState({ data: response.data });
    } catch (error) {
      this.setState({ error: "Something went wrong" });
    } finally {
      this.setState({ isRequesting: false });
    }
  };
}

export default App;

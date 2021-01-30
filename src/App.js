import { SHEDClient } from "./Client";
import React from 'react';






class App extends React.Component {
  state = { 
    playerID: null,
    matchID: null,
  };
  

  render() {
  

    if (this.state.playerID === null) {
      return (
        <div>
          <p>Play as</p>
          <button onClick={() => this.setState({ playerID: "0"})}>
            Player 0
          </button>
          <button onClick={() => this.setState({ playerID: "1"})}>
            Player 1
          </button>
        </div>
      );
    }
    return (
      <div>
        <SHEDClient playerID={this.state.playerID} />
      </div>
    );
  }
}
 

export default App;

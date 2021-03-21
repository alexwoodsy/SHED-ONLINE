import React from 'react'
import "../pages/Style.css"


class MenuDropdown extends React.Component {
    container = React.createRef();
    state = {
        open: false,
    }

    handleButtonClick = () => {
        this.setState(state => {
          return {
            open: !state.open,
          };
        });
      };


    handleClickOutside = event => {
        if (this.container.current && !this.container.current.contains(event.target)) {
          this.setState({
            open: false,
          });
        }
      };


    componentDidMount() {
        document.addEventListener("mousedown", this.handleClickOutside);
    }
    componentWillUnmount() {
      document.removeEventListener("mousedown", this.handleClickOutside);
    }


    render() {
        return (
            <div id="MenuContainer" ref={this.container}>
                <button  id="MenuButton" onClick={this.handleButtonClick} />
                {this.state.open && (
                    <div className="LeftDropdown">
                    <ul>
                        <li>Leave</li>
                        <li>Rules</li>
                        <li onClick={() => {navigator.clipboard.writeText(this.props.matchID)}}>Copy Match ID</li>
                    </ul>
                    </div>
                )}
            </div>
        )
    } 
}

class ChatBar extends React.Component {
    container = React.createRef();
    state = {
        open: false,
    }

    handleButtonClick = () => {
        this.setState(state => {
          return {
            open: !state.open,
          };
        });
      };


    handleClickOutside = event => {
        if (this.container.current && !this.container.current.contains(event.target)) {
          this.setState({
            open: false,
          });
        }
      };


    componentDidMount() {
        document.addEventListener("mousedown", this.handleClickOutside);
    }
    componentWillUnmount() {
      document.removeEventListener("mousedown", this.handleClickOutside);
    }

    message = () => {
        return (
            <div>messagessssss</div>
        )
    }


    render() {
        return (
            <div id="ChatContainer" ref={this.container}>
                <button type="submit" id="ChatButton" onClick={this.handleButtonClick} />
                {this.state.open && (
                    <div className="RightDropdown">
                        messages
                    </div>
                )}
            </div>
        )
    }
}


const Menu = (props) => {
    return (
        <div id="menuBar">
            <MenuDropdown {...props} />
            <ChatBar />
        </div>
    )
}



export default Menu
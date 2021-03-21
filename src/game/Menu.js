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
  constructor(props) {
    super(props)
    this.container = React.createRef();
    this.state = {
      open: false,
      newMessage: "",
    }
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


    updateNewMessage (event) {
      this.setState({newMessage: event.target.value })
    }

    sendNewMessage (event) {
      if (this.state.newMessage !== "") {
        this.props.sendChatMessage(this.state.newMessage)
        this.setState({newMessage: "" })
      }
      event.preventDefault();
    }

    componentDidMount() {
        document.addEventListener("mousedown", this.handleClickOutside);
    }
    componentWillUnmount() {
      document.removeEventListener("mousedown", this.handleClickOutside);
    }

   


    render() {
      let messages = [] 
      if (this.props.chatMessages !== undefined && this.props.chatMessages.length > 0) {
        messages = this.props.chatMessages.map((message)=>{
          return {sender: this.props.playerNames[parseInt(message.sender)],
              text: message.payload}
        })
      }
      
        return (
            <div id="ChatContainer" ref={this.container}>
                <button type="submit" id="ChatButton" onClick={this.handleButtonClick} />
                {this.state.open && (
                    <div className="RightDropdown">
                        
                          <ul id="messagesList">
                          {messages.map((message, index)=> (
                            <li key={index}>{message.sender}: {message.text}</li>
                            ))}
                          </ul>
                        
                        
                          <form className="chatSubmit" onSubmit={(event)=>{this.sendNewMessage(event)}} >
                          <input type="text" value={this.state.newMessage} onChange={(event)=>this.updateNewMessage(event)} /> 
                          <input id="sendButton" type="submit" value="" onSubmit={(event)=>{this.sendNewMessage(event)}} />
                          </form>
                          
                        
                    </div>
                )}
            </div>
        )
    }
}


const Menu = (props) => {

    if (props.sendChatMessage === undefined) {
      return (
        <div id="menuBar">
            <MenuDropdown {...props} />
        </div>
      )
    } else {
      return (
        <div id="menuBar">
            <MenuDropdown {...props} />
            <ChatBar {...props} />
        </div>
      )
    }
    
}



export default Menu
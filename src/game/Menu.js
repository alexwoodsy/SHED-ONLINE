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
    this.Notificationinterval = null;
    this.state = {
      open: false,
      newMessage: "",
      messages: [],
      messageNotification: null,
      unreadNotifications: 0,
    }
  }
  
    handleButtonClick = () => {
        this.setState(state => {
          return {
            open: !state.open,
            messageNotification: null,
            unreadNotifications: 0
          };
        });
      };


    handleClickOutside = event => {
      if (this.container.current && !this.container.current.contains(event.target)) {
        this.setState({
          open: false,
          unreadNotifications: 0
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
    componentDidUpdate(prevProps) {
      if (this.props.chatMessages !==prevProps.chatMessages) {
        let messages = [] 
        if (this.props.chatMessages !== undefined && this.props.chatMessages.length > 0) {
          messages = this.props.chatMessages.map((message)=>{
            return {sender: this.props.playerNames[parseInt(message.sender)],
                text: message.payload}
          })
          let lastMessage = messages[messages.length-1]
          let unreadNotifications = this.state.unreadNotifications
          console.log(this.state.unreadNotifications)
          if (this.props.clientName === lastMessage.sender) {
            lastMessage = null;
            console.log('was sender')
          } else {
            unreadNotifications++
          }
          console.log(this.state.unreadNotifications)
          this.setState({
            messageNotification: lastMessage,
            messages: messages,
            unreadNotifications: unreadNotifications
          })

          this.interval = setTimeout(() => this.setState({messageNotification: null}), 3000);
        }
      }
      
      
    }

    componentWillUnmount() {
      document.removeEventListener("mousedown", this.handleClickOutside);
      clearInterval(this.Notificationinterval)
    }

     
    render() {
        return (
            <div id="ChatContainer" ref={this.container}>
              <button type="submit" id="ChatButton" onClick={this.handleButtonClick} />
              {this.state.unreadNotifications>0 && (
                <span id="NotificationBubble">{this.state.unreadNotifications}</span>
              )}
              {this.state.open && (
                  <div className="RightDropdown">
                    <ul id="messagesList">
                      {this.state.messages.map((message, index)=> (
                        <li 
                          key={index} 
                          id="messageItem" 
                          style={message.sender===this.props.clientName?{"textShadow": "2px 2px  rgb(255, 230, 0)"}:{}}
                        >
                          {message.sender===this.props.clientName?"you":message.sender}: {message.text}
                        </li>
                        ))}
                    </ul>
                  
                    <form className="chatSubmit" onSubmit={(event)=>{this.sendNewMessage(event)}} >
                      <input type="text" value={this.state.newMessage} onChange={(event)=>this.updateNewMessage(event)} /> 
                      <input id="sendButton" type="submit" value="" onSubmit={(event)=>{this.sendNewMessage(event)}} />
                    </form>     
                  </div>
                )}
                {this.state.messageNotification!==null && !this.state.open && (
                  <div className="Notification" onClick={this.handleButtonClick} >
                    {this.state.messageNotification.sender}: {this.state.messageNotification.text}
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
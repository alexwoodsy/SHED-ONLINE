import React from 'react'
import "../pages/Style.css"
import reset from '../images/magicEvents/reset.png'
import invisible from '../images/magicEvents/Invis.png'
import highlow from '../images/magicEvents/HighOrLow.png'
import burn from '../images/magicEvents/burn.png'
import ash from '../images/magicEvents/Ash_H.png'
import { Checkbox } from '@material-ui/core/';


const { origin } = window.location;


class MenuDropdown extends React.Component {
    container = React.createRef();
    state = {
        open: false,
        showRules: false,
        showSharingMenu: false,
        showInfo: false,
    }

    handleButtonClick = () => {
        this.setState(state => {
          return {
            open: !state.open,
            showRules: false,
            showSharingMenu: false,
            showInfo: false
          };
        });
      };

    handleRulesClick = () => {
      this.setState(state => {
        return {
          showRules: !state.showRules,
          open: false,
        };
      });
    }

    handleInfoClick = () => {
      this.setState(state => {
        return {
          showInfo: !state.showInfo,
          open: false,
        };
      });
    }

    handleCopyMatchId = () => {
      if (!this.props.isMobile) {
        navigator.clipboard.writeText(`${origin}/matchLinkRedirect/${this.props.matchID}`)
      }
      
      this.setState(state => {
        return {
          open: false,
          showSharingMenu: this.props.isMobile ? (!state.showSharingMenu): false,
        };
      });
    }


    handleClickOutside = event => {
        if (this.container.current && !this.container.current.contains(event.target)) {
          this.setState({
            open: false,
            showRules: false,
            showSharingMenu: false,
            showInfo: false,
          });
        }
      };


    componentDidMount() {
        document.addEventListener("mousedown", this.handleClickOutside);
        document.addEventListener("touchstart", this.handleClickOutside)
    }
    componentWillUnmount() {
      document.removeEventListener("mousedown", this.handleClickOutside);
      document.removeEventListener("touchstart", this.handleClickOutside);
    }


    render() {
        return (
            <div id="MenuContainer" ref={this.container}>
                <button  id="MenuButton" onClick={this.handleButtonClick} />
                {this.state.open && (
                    <div className="LeftDropdown">
                    <ul>
                        <li onClick={this.handleRulesClick} >Rules</li>
                        <li onClick={this.handleCopyMatchId}> 
                          {this.props.isMobile? "Link to Join Match": "Copy link to clipboard"}
                        </li>
                        {this.props.matchInfo !== undefined && (<li onClick={this.handleInfoClick} >Match Info</li>)}
                    </ul>
                    </div>
                )}
                {this.state.showRules && (
                  <div className="centerDropdown"> 
                    <h1>Rules</h1>
                    <p>The aim of SHED is to be the first player to clear their bench. </p>

                    <p>Your Bench is used when the deck and your hand are depleted.
                    you can swap between the Bench ONLY at the start of the game.</p>

                    <p>A Valid move consists of playing a higher card than that
                    previosuly laid, unless you play a magic card (2,3 or 10).
                    <br/>
                    2 = Reset the pile <img id="rulesImage" src={reset} alt={''}/>
                    <br/>
                    3 = Invisible, meaning the next player must play according to the card below<img id="rulesImage" src={invisible} alt={''}/>
                    <br/>
                    10 = Burns the deck <img id="rulesImage" src={burn} alt={''}/>
                    <br/>
                    7 = You get to choose if the next player has to go higher or lower
                      than a 7. This CANNOT be played on cards with rank {'>'} 7 (unless playing in Dan mode)<img id="rulesImage" src={highlow} alt={''}/> <br/>
                      <br/>
                      The deck is also burnt when all 4 suits of the same rank are in the pile<img id="rulesImage" src={ash} alt={''}/> </p>
                  </div>
                )}
                {this.state.showSharingMenu && (
                  <div className="centerDropdown" >
                    <div className="inlineSubmit">
                        <div style={{fontSize: 40,width: "100%" , textAlign: "center", padding: "10px"}}>share link to match</div>
                        <input 
                          style={{width: "100%", color: "rgba(255, 255, 255, 1)"}}
                          onChange={()=>null}
                          type="text" 
                          onFocus={(event)=>{event.target.select()}} 
                          value={`${origin}/matchLinkRedirect/${this.props.matchID}`} />
                    </div>
                  </div>
                )}
                {this.state.showInfo && (
                  <div className="LeftDropdown" >
                    <h2>Game settings:</h2>
                     <Checkbox 
                        color="default"
                        onClick={()=>{}}//disabled
                        checked={this.props.matchInfo.playOnAfterWin}
                      />
                      Play on after win
                      <br/>
                      <Checkbox 
                        color="default"
                        onClick={()=>{}}//disabled
                        checked={this.props.matchInfo.DanMode}
                      />
                      Dan mode (7 is magic)
                      <br/>
                      <Checkbox 
                        color="default"
                        onClick={()=>{}}//disabled
                        checked={this.props.matchInfo.CutIn}
                      />
                      Cut Ins 
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
    this.chatList = React.createRef();
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

  scrollToBottom = () => {
    if (this.chatList.current !== null) {
      this.chatList.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } 
  }

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
        document.addEventListener("touchstart", this.handleClickOutside);
        this.scrollToBottom();
    }
    componentDidUpdate(prevProps) {
      this.scrollToBottom()
      if (this.props.chatMessages !==prevProps.chatMessages) {
        let messages = [] 
        if (this.props.chatMessages !== undefined && this.props.chatMessages.length > 0) {
          messages = this.props.chatMessages.map((message)=>{
            return {sender: this.props.playerNames[parseInt(message.sender)],
                text: message.payload}
          })
          let lastMessage = messages[messages.length-1]
          let unreadNotifications = this.state.unreadNotifications
          
          if (this.props.clientName === lastMessage.sender) {
            lastMessage = null;
          } else {
            unreadNotifications++
          }
          
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
      document.removeEventListener("touchstart", this.handleClickOutside);
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
                    <ul id="messagesList" >
                      {this.state.messages.map((message, index)=> (
                        <li
                          key={index} 
                          ref={this.chatList}
                          id="messageItem" 
                          style={message.sender===this.props.clientName?{"textShadow": "2px 2px rgba(0,212,255,0.5)"}:{}}
                        >
                          {message.sender===this.props.clientName?"you":message.sender}: {message.text}
                        </li>
                        ))}
                    </ul>
                  
                    <form className="chatSubmit" onSubmit={(event)=>{this.sendNewMessage(event)}} >
                      <input type="text" style={{color: "#fff"}} value={this.state.newMessage} onChange={(event)=>this.updateNewMessage(event)} /> 
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
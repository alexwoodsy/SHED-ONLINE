import { useParams } from 'react-router-dom'
//redirect the user staright to page to add a user name
export const JoinByLink = (props) => {
    let { matchID } = useParams();
    localStorage.setItem("joinByLinkMatchID", matchID)
    props.history.push("/lobby")
    
    return (null)
}

export default JoinByLink;
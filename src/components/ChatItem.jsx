import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/ChatList.css";

const ChatItem = ({ chat }) => {
  const navigate = useNavigate();

  return (
    <li
      className="list-group-item d-flex align-items-center p-3 chat-item"
      onClick={() => navigate(`/messages/${chat.id}`)}
    >
      <img
        src={chat.profile_pic || "https://i.imgur.com/6VBx3io.png"}
        alt="Profile"
        className="chat-profile-pic rounded-circle img-thumbnail"
      />
      <div className="ms-3 flex-grow-1">
        <span className="fw-bold text-primary">{chat.full_name}</span>
        <p className="chat-last-message text-muted mb-0">{chat.last_message}</p>
      </div>
    </li>
  );
};

export default ChatItem;

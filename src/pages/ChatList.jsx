import { useEffect, useState } from "react";
import { fetchChatList } from "../services/chatService";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import ChatItem from "../components/ChatItem.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/ChatList.css";

const ChatList = () => {
  const { user } = useAuth();
  const [chatList, setChatList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadChats = async () => {
      try {
        const data = await fetchChatList(user.id);
        setChatList(data);
      } catch (error) {
        console.error("Error fetching chat list:", error.message);
      }
    };

    if (user) {
      loadChats();
    }
  }, [user]);

  return (
    <div className="container mt-4">
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white text-center">
          <h2 className="mb-0">Messages</h2>
        </div>
        <div className="card-body p-0">
          {chatList.length === 0 ? (
            <p className="text-center p-3 text-muted">No previous chats.</p>
          ) : (
            <ul className="list-group list-group-flush">
              {chatList.map((chat) => (
                <ChatItem key={chat.id} chat={chat} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatList;

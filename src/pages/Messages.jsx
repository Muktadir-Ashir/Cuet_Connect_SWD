import { useEffect, useState } from "react";
import { fetchMessages, sendMessage, subscribeToMessages } from "../services/messageService";
import { useAuth } from "../context/AuthContext.jsx";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/Messages.css";

const Messages = () => {
  const { user } = useAuth();
  const { id: receiverId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !receiverId) return;

    const loadMessages = async () => {
      try {
        const data = await fetchMessages(user.id, receiverId);
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error.message);
      }
    };

    loadMessages();

    // ✅ Subscribe to real-time messages
    const subscription = subscribeToMessages(user.id, receiverId, (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    // ✅ Unsubscribe properly when navigating away
    return () => {
      if (subscription && typeof subscription.unsubscribe === "function") {
        subscription.unsubscribe();
      }
    };
  }, [user, receiverId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage(receiverId, newMessage);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error.message);
    }
  };

  return (
    <div className="messages-container">
      <h2>Chat</h2>
      <div className="messages-list">
        {messages.map((msg) => (
          <div key={msg.id} className={msg.sender_id === user.id ? "message sent" : "message received"}>
            {msg.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>

      {/* ✅ Back to Chat List */}
      <button className="back-button" onClick={() => navigate("/chat-list")}>Back to Messages</button>
    </div>
  );
};

export default Messages;

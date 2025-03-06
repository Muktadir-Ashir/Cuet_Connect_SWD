import { supabase } from "../supabaseClient";

export const fetchChatList = async (userId) => {
    const { data, error } = await supabase
      .from("messages")
      .select(`
        id, sender_id, receiver_id, content, timestamp,
        sender:profiles!fk_messages_sender (id, full_name, profile_pic),
        receiver:profiles!fk_messages_receiver (id, full_name, profile_pic)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Error fetching chat list:", error.message);
      throw error;
    }

    // ✅ Group messages by conversation partner
    const chatMap = {};
    data.forEach((msg) => {
      const chatUser = msg.sender_id === userId ? msg.receiver : msg.sender;

      // 🚀 Exclude the logged-in user from appearing in the chat list
      if (!chatUser || chatUser.id === userId) return;

      if (!chatMap[chatUser.id]) {
        chatMap[chatUser.id] = {
          id: chatUser.id,
          full_name: chatUser.full_name,
          profile_pic: chatUser.profile_pic || "https://i.imgur.com/6VBx3io.png",
          role: chatUser.role || "Unknonwn Role" ,
          last_message: msg.content,
          last_timestamp: msg.timestamp,
        };
      }
    });

    return Object.values(chatMap).sort((a, b) => new Date(b.last_timestamp) - new Date(a.last_timestamp));
};

  
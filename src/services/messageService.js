import { supabase } from "../supabaseClient";

/** ✅ Fetch messages between two users */
export const fetchMessages = async (userId, receiverId) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .or(`sender_id.eq.${receiverId},receiver_id.eq.${receiverId}`)
    .order("timestamp", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error.message);
    throw error;
  }

  return data;
};

/** ✅ Send a message */
export const sendMessage = async (receiverId, content) => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) throw new Error("User not logged in");

  const senderId = sessionData.session.user.id;

  const { error } = await supabase
    .from("messages")
    .insert([{ sender_id: senderId, receiver_id: receiverId, content }]);

  if (error) throw error;
};

/** ✅ Subscribe to real-time messages */
export const subscribeToMessages = (userId, receiverId, callback) => {
  return supabase
    .channel("messages_channel")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      (payload) => {
        const newMsg = payload.new;
        if (
          (newMsg.sender_id === userId && newMsg.receiver_id === receiverId) ||
          (newMsg.sender_id === receiverId && newMsg.receiver_id === userId)
        ) {
          callback(newMsg);
        }
      }
    )
    .subscribe();
};

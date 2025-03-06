import { supabase } from "../supabaseClient";

/** Follow a user */
export const followUser = async (followingId) => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error("User not logged in");

  const { error } = await supabase.from("follows").insert([{ follower_id: userId, following_id: followingId }]);
  if (error) throw error;
};

/** Unfollow a user */
export const unfollowUser = async (followingId) => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error("User not logged in");

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", userId)
    .eq("following_id", followingId);
  
  if (error) throw error;
};

/** Get Followed Users */


/** Fetch followed users */
export const getFollowedUsers = async () => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData?.session?.user) {
    console.error("Error: User not logged in or session missing.");
    return [];
  }

  const userId = sessionData.session.user.id;

  const { data, error } = await supabase
    .from("follows")
    .select(`
      following_id,
      profiles:profiles!follows_following_id_fkey (id, full_name, profile_pic)
    `)
    .eq("follower_id", userId);

  if (error) {
    console.error("Error fetching followed users:", error.message);
    return [];
  }

  return data.map((follow) => follow.profiles);
};



/** Check if a user is followed */
export const isFollowingUser = async (followingId) => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error("User not logged in");

  const { data, error } = await supabase
    .from("follows")
    .select("*")
    .eq("follower_id", userId)
    .eq("following_id", followingId);

  if (error) throw error;
  return data.length > 0;
};

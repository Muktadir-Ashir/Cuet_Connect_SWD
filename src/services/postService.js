import { supabase } from "../supabaseClient";

/** Fetch all posts with user details, roles, likes, and comments */
export const fetchAllPosts = async () => {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      id, user_id, content, image_url, created_at,
      profiles!fk_posts_user (id, full_name, profile_pic, role),
      likes (id),
      comments (id)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error.message);
    throw error;
  }

  return data.map(post => ({
    ...post,
    profiles: post.profiles || { 
      full_name: "Unknown User", 
      profile_pic: "https://i.imgur.com/6VBx3io.png",
      role: "Unknown Role"
    },
    likes: post.likes ? post.likes.length : 0,  // ✅ Fix counting logic
    comments: post.comments ? post.comments.length : 0 // ✅ Fix counting logic
  }));
};





/** Like a post */
export const likePost = async (postId) => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) throw new Error("User not logged in");

  const userId = sessionData.session.user.id;

  // 🔹 Check if the user already liked the post
  const { data: existingLikes, error: fetchError } = await supabase
    .from("likes")
    .select("*")  // ✅ Allow multiple results
    .eq("post_id", postId)
    .eq("user_id", userId);

  if (fetchError) console.error("Error fetching likes:", fetchError.message);

  if (existingLikes.length > 0) {
    // 🔹 Unlike if already liked
    const { error } = await supabase
      .from("likes")
      .delete()
      .match({ post_id: postId, user_id: userId });

    if (error) throw error;
  } else {
    // 🔹 Like the post
    const { error } = await supabase
      .from("likes")
      .insert([{ post_id: postId, user_id: userId }]);

    if (error) throw error;
  }

  // ✅ Fetch updated like count after action
  const { count, error: countError } = await supabase
    .from("likes")
    .select("*", { count: "exact" })  // ✅ Ensure accurate count
    .eq("post_id", postId);

  if (countError) {
    console.error("Error fetching like count:", countError.message);
    throw countError;
  }

  return count;  // ✅ Return updated like count
};



/** Add a comment */
export const addComment = async (postId, content) => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) throw new Error("User not logged in");

  const userId = sessionData.session.user.id;

  const { data, error } = await supabase
    .from("comments")
    .insert([{ post_id: postId, user_id: userId, content }])
    .select("id") // ✅ Retrieve the new comment's ID
    .single();

  if (error) {
    console.error("Error adding comment:", error.message);
    throw error;
  }

  return data; // ✅ Return the new comment data (including ID)
};


/** Fetch comments for a post */
export const fetchComments = async (postId) => {
  const { data, error } = await supabase
    .from("comments")
    .select(`
      id, content, created_at,
      profiles!inner (full_name, profile_pic)
    `)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error.message);
    throw error;
  }

  return data;
};

/** Delete a comment */
export const deleteComment = async (commentId) => {
  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) {
    console.error("Error deleting comment:", error.message);
    throw error;
  }
};


/** Update a comment */
export const updateComment = async (commentId, newContent) => {
  const { error } = await supabase.from("comments").update({ content: newContent }).eq("id", commentId);
  if (error) {
    console.error("Error updating comment:", error.message);
    throw error;
  }
};

/** Create a new post */
export const createPost = async (content, imageFile = null) => {
  const { data: userSession, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !userSession.session) throw new Error("User not logged in");

  const userId = userSession.session.user.id;
  let imageUrl = null;

  // Upload image if provided
  if (imageFile) {
    const filePath = `post_images/${userId}-${Date.now()}-${imageFile.name}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("post_images") // Ensure this matches the correct bucket name
      .upload(filePath, imageFile, { upsert: true });

    if (error) {
      console.error("Image Upload Error:", error.message);
      throw new Error("Image upload failed.");
    }

    // Retrieve the correct public URL
    const { data: publicUrlData } = await supabase
      .storage
      .from("post_images")
      .getPublicUrl(filePath);

    if (!publicUrlData) throw new Error("Failed to retrieve image URL");

    imageUrl = publicUrlData.publicUrl;
  }

  // Insert the post into the database
  const { error } = await supabase
    .from("posts")
    .insert([{ user_id: userId, content, image_url: imageUrl }]);

  if (error) throw error;
};

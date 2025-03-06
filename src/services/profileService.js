import { supabase } from "../supabaseClient";

/** Upload profile picture to Supabase Storage */
export const uploadProfilePicture = async (file) => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session) throw new Error("User not logged in");

  const userId = sessionData.session.user.id;
  const filePath = `profile_pictures/${userId}-${Date.now()}-${file.name}`;

  // ✅ Upload file to Supabase Storage
  const { data, error } = await supabase.storage
    .from("profile_pictures")
    .upload(filePath, file, { upsert: true });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  // ✅ Get the full public URL
  const { data: publicUrlData } = supabase.storage
    .from("profile_pictures")
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData.publicUrl;

  if (!publicUrl) throw new Error("Failed to retrieve image URL");

  // ✅ Update user profile with new profile picture URL
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ profile_pic: publicUrl })
    .eq("id", userId);

  if (updateError) throw new Error(`Profile update failed: ${updateError.message}`);

  return publicUrl;
};

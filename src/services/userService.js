import { supabase } from "../supabaseClient";

/** Search for users by name or email */
export const searchUsers = async (query) => {
  if (!query.trim()) return []; // ✅ Prevents unnecessary queries

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, profile_pic, role, organization") // ✅ Added role & organization fields
    .or(`full_name.ilike.%${query}%, email.ilike.%${query}%`);  // ✅ Allows searching by name or email

  if (error) {
    console.error("Error searching users:", error.message);
    throw error;
  }

  return data;
};

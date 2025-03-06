import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { supabase } from "../supabaseClient";
import { uploadProfilePicture } from "../services/profileService";
import { getFollowedUsers } from "../services/followService";
import FollowButton from "../components/FollowButton.jsx";
import { useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Profile.css";

const Profile = () => {
  const { user } = useAuth();
  const { userId } = useParams(); // User being viewed
  const isMyProfile = !userId || user?.id === userId;

  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    role: "",
    job_position: "",
    organization: "",
    profile_pic: "",
  });

  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [followedUsers, setFollowedUsers] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "full_name, email, role, job_position, organization, profile_pic"
        )
        .eq("id", userId || user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    const fetchFollowedUsers = async () => {
      if (!user) return;
      try {
        const followed = await getFollowedUsers();
        setFollowedUsers(followed);
      } catch (error) {
        console.error("Error fetching followed users:", error.message);
      }
    };

    fetchProfile();
    if (isMyProfile) fetchFollowedUsers();
  }, [user, userId, isMyProfile]);

  if (!profile) return <p>Loading...</p>;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        role: profile.role,
        job_position: profile.job_position,
        organization: profile.organization,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating profile:", error.message);
    } else {
      alert("Profile updated successfully!");
    }
  };

  const handleProfilePictureUpload = async () => {
    if (!imageFile) return alert("Please select an image!");

    try {
      const imageUrl = await uploadProfilePicture(imageFile);
      setProfile({ ...profile, profile_pic: imageUrl });
      alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading profile picture:", error.message);
    }
  };

  return (
    <div className="container profile-container">
      <h2 className="text-center text-primary">
        {isMyProfile ? "My Profile" : profile.full_name}
      </h2>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <form onSubmit={handleUpdateProfile} className="profile-form">
          <div className="text-center mb-3">
            <img
              src={profile.profile_pic || "https://i.imgur.com/6VBx3io.png"}
              alt="Profile"
              className="profile-pic img-thumbnail"
            />
            <input
              type="file"
              accept="image/*"
              className="form-control mt-2"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
            <button
              type="button"
              className="btn btn-secondary mt-2"
              onClick={handleProfilePictureUpload}
            >
              Upload Picture
            </button>
          </div>

          <div className="mb-3">
            <label className="form-label">Full Name:</label>
            <input
              type="text"
              className="form-control"
              value={profile.full_name}
              onChange={(e) =>
                setProfile({ ...profile, full_name: e.target.value })
              }
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email:</label>
            <input
              type="email"
              className="form-control"
              value={profile.email}
              disabled
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Role:</label>
            <select
              className="form-select"
              value={profile.role}
              onChange={(e) => setProfile({ ...profile, role: e.target.value })}
              required
            >
              <option value="">Select Role</option>
              <option value="Student">Student</option>
              <option value="Alumni">Alumni</option>
            </select>
          </div>

          {profile.role === "Alumni" && (
            <>
              <div className="mb-3">
                <label className="form-label">Current Job Position:</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.job_position}
                  onChange={(e) =>
                    setProfile({ ...profile, job_position: e.target.value })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Company/University:</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.organization}
                  onChange={(e) =>
                    setProfile({ ...profile, organization: e.target.value })
                  }
                />
              </div>
            </>
          )}

          {!isMyProfile && <FollowButton userId={userId} />}

          {isMyProfile && (
            <div>
              <h4>Following:</h4>
              {followedUsers.length === 0 ? (
                <p className="text-muted">No followed users yet.</p>
              ) : (
                <ul className="list-group">
                  {followedUsers.map((followed) => (
                    <li
                      key={followed.id}
                      className="list-group-item d-flex align-items-center"
                    >
                      <img
                        src={
                          followed.profile_pic ||
                          "https://i.imgur.com/6VBx3io.png"
                        }
                        alt="User"
                        width="40"
                        height="40"
                        className="rounded-circle me-2"
                      />
                      {followed.full_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100">
            Update Profile
          </button>
        </form>
      )}
    </div>
  );
};

export default Profile;

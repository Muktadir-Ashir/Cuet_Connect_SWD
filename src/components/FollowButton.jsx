import { useState, useEffect } from "react";
import { followUser, unfollowUser, isFollowingUser } from "../services/followService";

const FollowButton = ({ userId }) => {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkFollowingStatus = async () => {
      try {
        const isFollowing = await isFollowingUser(userId);
        setFollowing(isFollowing);
      } catch (error) {
        console.error("Error checking follow status:", error.message);
      }
    };
    checkFollowingStatus();
  }, [userId]);

  const handleFollow = async () => {
    setLoading(true);
    try {
      if (following) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
      setFollowing(!following);
    } catch (error) {
      console.error("Error updating follow status:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleFollow} disabled={loading} className={`btn ${following ? "btn-danger" : "btn-primary"}`}>
      {following ? "Unfollow" : "Follow"}
    </button>
  );
};

export default FollowButton;

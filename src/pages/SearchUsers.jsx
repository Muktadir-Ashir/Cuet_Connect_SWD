import { useEffect, useState } from "react";
import { searchUsers } from "../services/userService";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import FollowButton from "../components/FollowButton.jsx";
import "bootstrap/dist/css/bootstrap.min.css"; 
import "../styles/SearchUsers.css";

const SearchUsers = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const data = await searchUsers(searchQuery);
      setResults(data);
    } catch (error) {
      console.error("Error searching users:", error.message);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  };

  const handleButtonClick = (userId) => {
    if (userId === user.id) {
      navigate("/profile");
    } else {
      navigate(`/messages/${userId}`);
    }
  };

  return (
    <div className="container search-container mt-4">
      <h2 className="text-primary text-center mb-3">Search Users</h2>

      <div className="input-group mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search for students or alumni..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="btn btn-primary" onClick={handleSearch}>Search</button>
      </div>

      <ul className="list-group">
        {results.length === 0 ? (
          <p className="text-muted text-center">No users found.</p>
        ) : (
          results.map((profile) => (
            <li key={profile.id} className="list-group-item d-flex align-items-center">
              <img
                src={profile.profile_pic || "https://i.imgur.com/6VBx3io.png"}
                alt="Profile"
                className="profile-pic img-thumbnail"
              />
              <div className="ms-3 flex-grow-1">
                <span className="fw-bold">{profile.full_name}</span>
                <span className="text-muted d-block">({profile.role || "Unknown Role"})</span>
                {profile.role === "Alumni" && profile.organization && (
                  <p className="text-info mb-0">🏢 {profile.organization}</p>
                )}
              </div>
              <FollowButton userId={profile.id} />
              <button className="btn btn-success" onClick={() => handleButtonClick(profile.id)}>
                {profile.id === user.id ? "Profile" : "Message"}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default SearchUsers;

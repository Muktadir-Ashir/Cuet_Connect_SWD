import { useEffect, useState } from "react";
import PostCard from "../components/PostCard.jsx";
import {
  addComment,
  createPost,
  fetchAllPosts,
  fetchComments,
  likePost,
} from "../services/postService";
import "../styles/Newsfeed.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Newsfeed = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchAllPosts();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error.message);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      await createPost(newPost, imageFile);
      setNewPost("");
      setImageFile(null);

      const updatedPosts = await fetchAllPosts();
      setPosts(updatedPosts);
    } catch (error) {
      console.error("Error creating post:", error.message);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center text-white bg-primary py-3 rounded">Newsfeed</h2>

      {/* 🔹 Post Form */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <form onSubmit={handleCreatePost}>
            <div className="mb-3">
              <textarea
                placeholder="What's on your mind?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="form-control rounded-3 border"
                rows="3"
              />
            </div>
            <div className="mb-3">
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Post
            </button>
          </form>
        </div>
      </div>

      {/* 🔹 Posts List */}
      {loading ? (
        <p className="text-center text-muted">Loading posts...</p>
      ) : (
        <ul className="list-unstyled">
          {posts.length === 0 ? (
            <p className="text-center text-muted">No posts available</p>
          ) : (
            posts.map((post) => (
              <li key={post.id} className="mb-3">
                <PostCard post={post} />
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default Newsfeed;

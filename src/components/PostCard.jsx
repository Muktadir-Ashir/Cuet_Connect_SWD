import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../styles/PostCard.css";
import { likePost, fetchComments, addComment, deleteComment, updateComment } from "../services/postService";
import { useAuth } from "../context/AuthContext";

const PostCard = ({ post }) => {
  const { user } = useAuth();
  const defaultProfilePic = "https://i.imgur.com/6VBx3io.png";
  const [likes, setLikes] = useState(post.likes ?? 0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    const loadComments = async () => {
      try {
        const fetchedComments = await fetchComments(post.id);
        setComments(fetchedComments);
      } catch (error) {
        console.error("Error fetching comments:", error.message);
      }
    };
    loadComments();
  }, [post.id]);

  const handleLike = async () => {
    await likePost(post.id);
    setLikes((prev) => prev + 1);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      const addedComment = await addComment(post.id, newComment);
  
      // ✅ Use the ID returned from the database instead of Date.now()
      setComments([...comments, {
        id: addedComment.id,  // ✅ Actual Supabase ID
        content: newComment,
        profiles: { full_name: "You" },
        user_id: user.id
      }]);
  
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error.message);
    }
  };
  

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error.message);
    }
  };
  

  const handleEditComment = (comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const handleUpdateComment = async (commentId) => {
    try {
      await updateComment(commentId, editContent);
      setComments(comments.map((comment) => 
        comment.id === commentId ? { ...comment, content: editContent } : comment
      ));
      setEditingComment(null);
    } catch (error) {
      console.error("Error updating comment:", error.message);
    }
  };
  

  return (
    <div className="card shadow-sm mb-4 border-0 post-card">
      <div className="card-header bg-primary text-white d-flex align-items-center">
        <img
          src={post.profiles?.profile_pic || defaultProfilePic}
          alt="Profile"
          className="rounded-circle me-3 border profile-pic"
        />
        <div>
          <h6 className="mb-0">{post.profiles?.full_name || "Unknown User"}</h6>
          <small className="text-light">{post.profiles?.role || "Unknown Role"}</small>
        </div>
      </div>

      <div className="card-body">
        <p className="card-text">{post.content}</p>
        {post.image_url && <img src={post.image_url} alt="Post" className="img-fluid rounded post-image" />}
        <p className="text-muted small mt-2">{new Date(post.created_at).toLocaleString()}</p>
      </div>

      <div className="card-footer bg-white d-flex justify-content-start">
        <button className="btn btn-outline-danger btn-sm like-button" onClick={handleLike}>
          ❤️ {likes}
        </button>
      </div>

      <div className="card-footer bg-light">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleAddComment}>Comment</button>
        </div>

        {comments.length > 0 && (
          <ul className="list-group list-group-flush mt-2">
            {comments.slice(0, 2).map((comment) => (
              <li key={comment.id} className="list-group-item small d-flex justify-content-between">
                <div>
                  <strong>{comment.profiles?.full_name || "Unknown User"}:</strong> 
                  {editingComment === comment.id ? (
                    <>
                      <input
                        type="text"
                        className="form-control form-control-sm mt-1"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                      <button className="btn btn-success btn-sm mt-1" onClick={() => handleUpdateComment(comment.id)}>Save</button>
                    </>
                  ) : (
                    ` ${comment.content}`
                  )}
                </div>

                {user.id === comment.user_id || user.id === post.user_id ? (
                  <div>
                    {user.id === comment.user_id && (
                      <button className="btn btn-warning btn-sm me-2" onClick={() => handleEditComment(comment)}>Edit</button>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                  </div>
                ) : null}
              </li>
            ))}

            {comments.length > 2 && (
              <button
                className="btn btn-link text-primary p-0 mt-2"
                onClick={() => setShowAllComments(!showAllComments)}
              >
                {showAllComments ? "Hide Comments" : `See More Comments (${comments.length - 2})`}
              </button>
            )}

            {showAllComments &&
              comments.slice(2).map((comment) => (
                <li key={comment.id} className="list-group-item small">
                  <strong>{comment.profiles?.full_name || "Unknown User"}:</strong> {comment.content}
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
};

PostCard.propTypes = {
  post: PropTypes.shape({
    profiles: PropTypes.shape({
      profile_pic: PropTypes.string,
      full_name: PropTypes.string,
      role: PropTypes.string,
    }),
    content: PropTypes.string.isRequired,
    image_url: PropTypes.string,
    created_at: PropTypes.string.isRequired,
  }).isRequired,
};

export default PostCard;

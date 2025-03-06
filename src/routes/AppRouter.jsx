import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Profile from "../pages/Profile.jsx";
import ChatList from "../pages/ChatList.jsx";
import SearchUsers from "../pages/SearchUsers.jsx";
import Messages from "../pages/Messages";
import Newsfeed from "../pages/Newsfeed.jsx";
import Navbar from "../components/Navbar.jsx";

const PrivateRoute = ({ element }) => {
  const { user, loading } = useAuth();
  if (loading) return null;  // ✅ Prevents unnecessary redirects on refresh
  return user ? element : <Navigate to="/login" />;
};

const AppRouter = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* ✅ Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ✅ Private Routes (Require Login) */}
        <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
        <Route path="/search" element={<PrivateRoute element={<SearchUsers />} />} />
        {/* <Route path="/messages" element={<PrivateRoute element={<ChatList />} />} /> */}
        <Route path="/messages/:id" element={<PrivateRoute element={<Messages />} />} />
        <Route path="/chat-list" element={<PrivateRoute element={<ChatList />} />} />
        <Route path="/newsfeed" element={<PrivateRoute element={<Newsfeed />} />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;

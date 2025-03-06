import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/home.css"; // ✅ Keep additional custom styles

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="home-container">
      {/* 🔹 Carousel / Hero Section */}
      <section className="hero-section d-flex align-items-center justify-content-center text-center">
        <div className="container   p-4">
          <h1 className="fw-bold">Welcome to CUET Connect</h1>
          <p className="lead">Connecting CUET alumni and students for a brighter future!</p>
        </div>
      </section>

      {/* 🔹 About Us Section */}
      <section className="about-section py-5 bg-light text-center">
        <div className="container">
          <h2 className="text-primary">About CUET Connect</h2>
          <p className="fs-5">
            CUET Connect is a social platform designed to connect CUET students 
            and alumni, allowing them to share experiences, network, and support 
            each other in their professional journeys.
          </p>
        </div>
      </section>

      {/* 🔹 Explore / Quick Links */}
      {user && (
        <section className="quick-links text-center py-4">
          <div className="container">
            <h3 className="text-dark">Explore</h3>
            <div className="d-flex justify-content-center gap-3 mt-3">
              <a href="/profile" className="btn btn-primary px-4 py-2">Go to My Profile</a>
              <a href="/search" className="btn btn-secondary px-4 py-2">Search for Users</a>
              <a href="/newsfeed" className="btn btn-info px-4 py-2">Go to Newsfeed</a>
            </div>
          </div>
        </section>
      )}

      {/* 🔹 Footer */}
      <footer className="footer text-center py-3">
        <div className="container">
          <p className="mb-0">Contact Us: cuetconnect@support.com</p>
          <p className="mb-0">&copy; 2025 CUET Connect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import './Home.css';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  createdAt?: string;
  author?: {
    id: string;
    name: string;
  };
}

export const Home = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const data = await api.getAllBlogs(currentPage, limit);
        setBlogs(data.blogs || []);
        setTotalCount(data.count || data.blogs?.length || 0);
      } catch (err) {
        setError('Failed to load blogs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [currentPage]);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const goToDashboard = () => {
    navigate('/blog');
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="home-container">
      <div className="home-header">
        <div className="home-header-content">
          <div>
            <h1>Blog Feed</h1>
            <p>Discover blogs from everyone</p>
          </div>
          <div className="header-actions">
            <button onClick={goToDashboard} className="dashboard-button">
              My Blogs
            </button>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="home-main">
        <div className="home-wrapper">
          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">Loading blogs...</div>
          ) : blogs.length === 0 ? (
            <div className="no-blogs">
              <p>No blogs found yet.</p>
            </div>
          ) : (
            <>
              <div className="blogs-grid">
                {blogs.map((blog) => (
                  <article key={blog.id} className="blog-card">
                    <div className="blog-card-header">
                      <h2>{blog.title}</h2>
                    </div>
                    <p className="blog-content">{blog.content}</p>
                    <div className="blog-footer">
                      <div className="blog-author">
                        By <strong>{blog.author?.name || 'Unknown'}</strong>
                      </div>
                      {blog.createdAt && (
                        <p className="blog-date">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="pagination-button"
                  >
                    ← Previous
                  </button>
                  <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="pagination-button"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

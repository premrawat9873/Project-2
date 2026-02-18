import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import './Blog.css';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  createdAt?: string;
  author?: string;
}

export const Blog = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/signin');
      return;
    }

    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const data = await api.getBlog();
        setBlogs(Array.isArray(data) ? data : data.posts || []);
      } catch (err) {
        setError('Failed to load blogs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [token, navigate]);

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setSubmitting(true);
    try {
      const newBlog = await api.createBlog({ title, content });
      setBlogs([newBlog, ...blogs]);
      setTitle('');
      setContent('');
      setShowForm(false);
      setError('');
    } catch (err) {
      setError('Failed to create blog');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await api.deleteBlog(id);
        setBlogs(blogs.filter((blog) => blog.id !== id));
      } catch (err) {
        setError('Failed to delete blog');
        console.error(err);
      }
    }
  };

  const handleEditBlog = (blog: BlogPost) => {
    setEditingId(blog.id);
    setEditTitle(blog.title);
    setEditContent(blog.content);
  };

  const handleUpdateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editContent.trim()) {
      setError('Title and content are required');
      return;
    }

    setEditSubmitting(true);
    try {
      const updated = await api.updateBlog(editingId!, {
        title: editTitle,
        content: editContent,
      });
      setBlogs(blogs.map((blog) => (blog.id === editingId ? { ...blog, ...updated } : blog)));
      setEditingId(null);
      setEditTitle('');
      setEditContent('');
      setError('');
    } catch (err) {
      setError('Failed to update blog');
      console.error(err);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const goToHome = () => {
    navigate('/');
  };

  return (
    <div className="blog-container">
      <div className="blog-header">
        <div className="blog-header-content">
          <div>
            <h1>My Blog</h1>
            <p>Welcome, {user?.name || user?.email || 'Guest'}</p>
          </div>
          <div className="header-buttons">
            <button onClick={goToHome} className="home-button">
              ← All Blogs
            </button>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="blog-main">
        <div className="blog-wrapper">
          {error && <div className="error-message">{error}</div>}

          <div className="create-blog-section">
            <button
              onClick={() => setShowForm(!showForm)}
              className="create-blog-button"
            >
              {showForm ? '✕ Cancel' : '+ Create New Blog'}
            </button>

            {showForm && (
              <form onSubmit={handleCreateBlog} className="create-blog-form">
                <input
                  type="text"
                  placeholder="Blog Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={submitting}
                  required
                />
                <textarea
                  placeholder="Write your blog content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={submitting}
                  required
                />
                <button type="submit" disabled={submitting} className="submit-button">
                  {submitting ? 'Publishing...' : 'Publish Blog'}
                </button>
              </form>
            )}
          </div>

          {loading ? (
            <div className="loading">Loading blogs...</div>
          ) : blogs.length === 0 ? (
            <div className="no-blogs">
              <p>No blogs yet. Start creating your first blog post!</p>
            </div>
          ) : (
            <div className="blogs-grid">
              {blogs.map((blog) => (
                <article key={blog.id} className="blog-card">
                  <div className="blog-card-header">
                    <h2>{blog.title}</h2>
                    <div className="blog-card-actions">
                      <button
                        onClick={() => handleEditBlog(blog)}
                        className="edit-button"
                        title="Edit blog"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(blog.id)}
                        className="delete-button"
                        title="Delete blog"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                  <p className="blog-content">{blog.content}</p>
                  {blog.createdAt && (
                    <p className="blog-date">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {editingId && (
        <div className="edit-modal active">
          <div className="edit-modal-content">
            <div className="edit-modal-header">Edit Blog</div>
            <form onSubmit={handleUpdateBlog} className="edit-modal-form">
              <input
                type="text"
                placeholder="Blog Title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                disabled={editSubmitting}
                required
              />
              <textarea
                placeholder="Write your blog content here..."
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                disabled={editSubmitting}
                required
              />
              <div className="edit-modal-buttons">
                <button type="submit" disabled={editSubmitting} className="save-button">
                  {editSubmitting ? 'Updating...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={editSubmitting}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

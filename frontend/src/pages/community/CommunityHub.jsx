import { useEffect, useMemo, useState } from "react";
import io from "socket.io-client";
import api from "../../api/axios";
import useAuth from "../../hooks/useAuth";
import CommunityPostsProfessional from "./CommunityPostsProfessional";
import "./CommunityHub.css";

const CommunityHub = () => {
  const { user } = useAuth();

  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [channelSearch, setChannelSearch] = useState("");
  const [socket, setSocket] = useState(null);

  const socketUrl = useMemo(() => {
    const envSocketUrl = import.meta.env.VITE_SOCKET_URL;
    if (envSocketUrl) return envSocketUrl;
    const apiBase = import.meta.env.VITE_API_BASE_URL;
    if (apiBase) return apiBase.replace(/\/api\/?$/, "");
    return "http://localhost:5001";
  }, []);

  useEffect(() => {
    fetchChannels();
    const nextSocket = io(socketUrl, {
      auth: { token: localStorage.getItem("lms_token") },
    });

    nextSocket.on("channel:new", (channel) => {
      setChannels((prev) => [channel, ...prev]);
    });

    nextSocket.on("channel:updated", (channel) => {
      setChannels((prev) => prev.map((c) => (c._id === channel._id ? channel : c)));
    });

    nextSocket.on("channel:deleted", ({ id }) => {
      setChannels((prev) => prev.filter((c) => c._id !== id));
      setSelectedChannel((prev) => (prev?._id === id ? null : prev));
    });

    nextSocket.on("post:new", (post) => {
      setPosts((prev) => [post, ...prev]);
    });

    nextSocket.on("post:updated", (post) => {
      setPosts((prev) => prev.map((p) => (p._id === post._id ? post : p)));
    });

    nextSocket.on("post:deleted", ({ id }) => {
      setPosts((prev) => prev.filter((p) => p._id !== id));
    });

    nextSocket.on("post:liked", ({ postId, likes }) => {
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, likes } : p))
      );
    });

    setSocket(nextSocket);

    return () => {
      nextSocket.disconnect();
    };
  }, [socketUrl]);

  useEffect(() => {
    if (!selectedChannel) return;

    fetchPosts(selectedChannel._id);
    socket?.emit("join:channel", selectedChannel._id);

    return () => {
      socket?.emit("leave:channel", selectedChannel._id);
    };
  }, [selectedChannel, socket]);

  const fetchChannels = async () => {
    try {
      const response = await api.get("/api/community/channels");
      if (response.data.success) {
        const nextChannels = response.data.data;
        setChannels(nextChannels);
        if (nextChannels.length === 0) {
          setSelectedChannel(null);
        } else if (!selectedChannel) {
          setSelectedChannel(nextChannels[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
    }
  };

  const fetchPosts = async (channelId) => {
    try {
      setLoadingPosts(true);
      const response = await api.get(`/api/community/channels/${channelId}/posts`);
      if (response.data.success) {
        setPosts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleSelectChannel = (channel) => {
    setSelectedChannel(channel);
  };

  const visibleChannels = useMemo(() => {
    if (!channelSearch.trim()) return channels;
    const needle = channelSearch.toLowerCase();
    return channels.filter((channel) =>
      `${channel.name} ${channel.subject} ${channel.description}`
        .toLowerCase()
        .includes(needle)
    );
  }, [channels, channelSearch]);

  const isAdmin = user?.role === "admin";

  return (
    <div className="community-hub-container" id="community">
      <div className="community-main-content">
        <aside className="channel-strip">
          <div className="channel-strip-header">
            <div>
              <h3>Channels</h3>
              <p>Select a channel to view posts.</p>
            </div>
            <input
              type="text"
              className="channel-search"
              placeholder="Search channels"
              aria-label="Search channels"
              value={channelSearch}
              onChange={(event) => setChannelSearch(event.target.value)}
            />
          </div>
          <div className="channel-strip-list">
            {visibleChannels.length === 0 ? (
              <div className="empty-state">No channels yet</div>
            ) : (
              visibleChannels.map((channel) => (
                <button
                  key={channel._id}
                  type="button"
                  className={`channel-pill ${
                    selectedChannel?._id === channel._id ? "active" : ""
                  }`}
                  onClick={() => handleSelectChannel(channel)}
                >
                  <div className="channel-pill-header">
                    <div className="channel-pill-text">
                      <span className="channel-pill-title">{channel.name}</span>
                      <span className="channel-pill-meta">{channel.subject}</span>
                    </div>
                  </div>
                  {channel.description && (
                    <p className="channel-pill-description">
                      {channel.description}
                    </p>
                  )}
                </button>
              ))
            )}
          </div>
        </aside>
        <main className="community-main-area">
          {selectedChannel ? (
            <>
              <div className="channel-header">
                <div className="channel-header-info">
                  <h1>{selectedChannel.name}</h1>
                  <p className="channel-description">
                    {selectedChannel.description || ""}
                  </p>
                  <p className="channel-subject">📖 {selectedChannel.subject}</p>
                </div>

                <div className="channel-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowCreatePostModal(true)}
                  >
                    ➕ New Post
                  </button>
                </div>
              </div>

              <div className="sme-info-card">
                <div className="sme-left">
                  <div className="sme-avatar">
                    {selectedChannel.expert?.name?.[0]?.toUpperCase() || "E"}
                  </div>
                  <div className="sme-details">
                    <div className="sme-name">{selectedChannel.expert?.name || "Subject Matter Expert"}</div>
                    <div className="sme-title">
                      {selectedChannel.expert?.title || "Lecturer"}
                    </div>
                  </div>
                </div>
              </div>

              <CommunityPostsProfessional
                channelId={selectedChannel._id}
                posts={posts}
                loading={loadingPosts}
                user={user}
                sme={selectedChannel.expert}
                searchQuery={searchQuery}
                onAnnouncementsRemoved={(removedIds) =>
                  setPosts((prev) => prev.filter((post) => !removedIds.includes(post._id)))
                }
                onPostUpdated={(updatedPost) =>
                  setPosts((prev) =>
                    prev.map((post) => (post._id === updatedPost._id ? updatedPost : post))
                  )
                }
                onPostDeleted={(deletedId) =>
                  setPosts((prev) => prev.filter((post) => post._id !== deletedId))
                }
                socket={socket}
              />
            </>
          ) : (
            <div className="empty-channel-state">
              <div className="empty-icon">📭</div>
              <p>No channels available yet.</p>
            </div>
          )}
        </main>
      </div>

      {showCreateChannelModal && isAdmin && (
        <CreateChannelModal
          onClose={() => setShowCreateChannelModal(false)}
          onChannelCreated={(newChannel) => {
            setChannels((prev) => [newChannel, ...prev]);
            setSelectedChannel(newChannel);
            setShowCreateChannelModal(false);
          }}
        />
      )}

      {showCreatePostModal && selectedChannel && (
        <CreatePostModal
          channelId={selectedChannel._id}
          onClose={() => setShowCreatePostModal(false)}
          onPostCreated={(newPost) => {
            setPosts((prev) => [newPost, ...prev]);
            setShowCreatePostModal(false);
          }}
          userRole={user?.role}
        />
      )}
    </div>
  );
};

const PostCard = ({ post, user, socket, onDelete }) => {
  const [isLiked, setIsLiked] = useState(
    post.likes?.some((id) => id === user?._id || id?._id === user?._id) || false
  );
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title || "");
  const [editContent, setEditContent] = useState(post.content || "");

  useEffect(() => {
    if (!socket) return;

    const handleCommentNew = (comment) => {
      if (String(comment.post) !== String(post._id)) return;
      setComments((prev) => (prev.some((c) => c._id === comment._id) ? prev : [comment, ...prev]));
    };

    const handleCommentUpdated = (comment) => {
      if (String(comment.post) !== String(post._id)) return;
      setComments((prev) => prev.map((c) => (c._id === comment._id ? comment : c)));
    };

    const handleCommentDeleted = ({ id }) => {
      if (!id) return;
      setComments((prev) => prev.filter((c) => c._id !== id));
    };

    socket.on("comment:new", handleCommentNew);
    socket.on("comment:updated", handleCommentUpdated);
    socket.on("comment:deleted", handleCommentDeleted);

    return () => {
      socket.off("comment:new", handleCommentNew);
      socket.off("comment:updated", handleCommentUpdated);
      socket.off("comment:deleted", handleCommentDeleted);
    };
  }, [socket, post._id]);

  const handleLike = async () => {
    try {
      const response = await api.post(`/api/community/posts/${post._id}/like`);
      if (response.data.success) {
        setIsLiked(response.data.liked);
        setLikeCount(response.data.likesCount);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await api.delete(`/api/community/posts/${post._id}`);
      onDelete(post._id);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await api.put(`/api/community/posts/${post._id}`, {
        title: editTitle,
        content: editContent,
      });

      if (response.data.success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const handleAddComment = async (event) => {
    event.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await api.post(
        `/api/community/posts/${post._id}/comments`,
        { content: newComment.trim(), parentCommentId: replyTo?.id || null }
      );

      if (response.data.success) {
        setComments((prev) =>
          prev.some((c) => c._id === response.data.data._id)
            ? prev
            : [response.data.data, ...prev]
        );
        setNewComment("");
        setReplyTo(null);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(`/api/community/posts/${post._id}/comments`);
      if (response.data.success) {
        setComments(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const topLevelComments = comments.filter((comment) => !comment.parentComment);
  const repliesFor = (parentId) => comments.filter((comment) => comment.parentComment === parentId);

  const isAuthor = post.author?._id === user?._id || post.author === user?._id;
  const isAdmin = user?.role === "admin";

  return (
    <div className={`post-card ${post.type === "announcement" ? "announcement" : ""}`}>
      {post.type === "announcement" && (
        <div className="announcement-badge">📢 ANNOUNCEMENT</div>
      )}

      <div className="post-header">
        <div className="post-author">
          <div className="avatar-small">
            {post.author?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="author-info">
            <div className="author-name">{post.author?.name || "Unknown"}</div>
            <div className="post-time">
              {new Date(post.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {(isAuthor || isAdmin) && (
          <div className="post-menu">
            <button
              className="btn-icon"
              onClick={() => setIsEditing((prev) => !prev)}
              title="Edit"
              type="button"
            >
              ✏️
            </button>
            <button className="btn-icon" onClick={handleDelete} title="Delete">
              🗑️
            </button>
          </div>
        )}
      </div>

      <div className="post-content">
        {isEditing ? (
          <div className="post-edit">
            <input
              type="text"
              value={editTitle}
              onChange={(event) => setEditTitle(event.target.value)}
              placeholder="Post title"
            />
            <textarea
              rows="4"
              value={editContent}
              onChange={(event) => setEditContent(event.target.value)}
              placeholder="Post content"
            />
            <div className="post-edit-actions">
              <button type="button" className="btn btn-primary btn-sm" onClick={handleUpdate}>
                Save
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {post.title && <h3>{post.title}</h3>}
            <p>{post.content}</p>
          </>
        )}
      </div>

      <div className="post-stats">
        <span>❤️ {likeCount} likes</span>
        <span>💬 {comments.length} comments</span>
      </div>

      <div className="post-actions">
        <button
          className={`action-btn action-like ${isLiked ? "liked" : ""}`}
          onClick={handleLike}
          type="button"
        >
          {isLiked ? "❤️" : "🤍"} Like
        </button>
        <button
          className={`action-btn action-comment ${showComments ? "active" : ""}`}
          onClick={() => {
            setShowComments((prev) => !prev);
            if (!showComments && comments.length === 0) {
              fetchComments();
            }
          }}
          type="button"
        >
          💬 Comment
        </button>
        <button className="action-btn action-share" type="button">🔗 Share</button>
      </div>

      {showComments && (
        <div className="comments-section">
          <form onSubmit={handleAddComment} className="comment-form">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              {replyTo ? "Reply" : "Post"}
            </button>
          </form>

          {replyTo && (
            <div className="reply-banner">
              Replying to <strong>{replyTo.author}</strong>
              <button
                type="button"
                className="reply-cancel"
                onClick={() => setReplyTo(null)}
              >
                Cancel
              </button>
            </div>
          )}

          <div className="comments-list">
            {topLevelComments.map((comment) => (
              <div key={comment._id} className="comment-thread">
                <div className="comment">
                  <div className="comment-avatar">
                    {comment.author?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="comment-content">
                    <div className="comment-author">{comment.author?.name || "User"}</div>
                    <p>{comment.content}</p>
                    <button
                      type="button"
                      className="reply-btn"
                      onClick={() =>
                        setReplyTo({
                          id: comment._id,
                          author: comment.author?.name || "User",
                        })
                      }
                    >
                      Reply
                    </button>
                  </div>
                </div>

                {repliesFor(comment._id).map((reply) => (
                  <div key={reply._id} className="comment reply">
                    <div className="comment-avatar">
                      {reply.author?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="comment-content">
                      <div className="comment-author">{reply.author?.name || "User"}</div>
                      <p>{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CreateChannelModal = ({ onClose, onChannelCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subject: "",
    expertName: "",
    expertTitle: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.name || !formData.description || !formData.subject) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/api/community/channels", formData);

      if (response.data.success) {
        onChannelCreated(response.data.data);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error creating channel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Channel</h2>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Channel Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(event) =>
                setFormData({ ...formData, name: event.target.value })
              }
              placeholder="e.g., Data Structures"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(event) =>
                setFormData({ ...formData, description: event.target.value })
              }
              placeholder="Channel description"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Subject *</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(event) =>
                setFormData({ ...formData, subject: event.target.value })
              }
              placeholder="e.g., Algorithm Design"
            />
          </div>

          <div className="form-group">
            <label>Expert Name</label>
            <input
              type="text"
              value={formData.expertName}
              onChange={(event) =>
                setFormData({ ...formData, expertName: event.target.value })
              }
              placeholder="expert name"
            />
          </div>

          <div className="form-group">
            <label>Expert Position</label>
            <input
              type="text"
              value={formData.expertTitle}
              onChange={(event) =>
                setFormData({ ...formData, expertTitle: event.target.value })
              }
              placeholder="e.g., Senior Lecturer"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Channel"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CreatePostModal = ({ channelId, onClose, onPostCreated, userRole }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "post",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const title = formData.title.trim();
    const content = formData.content.trim();

    if (!title || !content) {
      setError("Title and content are required");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/api/community/posts", {
        ...formData,
        title,
        content,
        channelId,
      });

      if (response.data.success) {
        onPostCreated?.(response.data.data);
        setFormData({ title: "", content: "", type: formData.type });
        onClose();
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error creating post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Post</h2>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {userRole === "admin" && (
            <div className="form-group">
              <label>Post Type</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    value="post"
                    checked={formData.type === "post"}
                    onChange={(event) =>
                      setFormData({ ...formData, type: event.target.value })
                    }
                  />
                  Regular Post
                </label>
                <label>
                  <input
                    type="radio"
                    value="announcement"
                    checked={formData.type === "announcement"}
                    onChange={(event) =>
                      setFormData({ ...formData, type: event.target.value })
                    }
                  />
                  Announcement
                </label>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(event) =>
                setFormData({ ...formData, title: event.target.value })
              }
              placeholder="Post title"
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label>Content *</label>
            <textarea
              value={formData.content}
              onChange={(event) =>
                setFormData({ ...formData, content: event.target.value })
              }
              placeholder="Write your post..."
              rows={5}
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                loading || !formData.title.trim() || !formData.content.trim()
              }
            >
              {loading ? "Posting..." : "Post"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommunityHub;

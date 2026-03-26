import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import "./CommunityPostsProfessional.css";

const CommunityPostsProfessional = ({
  channelId,
  posts,
  loading,
  user,
  sme,
  searchQuery = "",
  onAnnouncementsRemoved,
  socket,
}) => {
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [hoveredPost, setHoveredPost] = useState(null);
  const [expandedPost, setExpandedPost] = useState(null);
  const [removingAnnouncements, setRemovingAnnouncements] = useState(false);
  const [discussionMessages, setDiscussionMessages] = useState([]);
  const [discussionLoading, setDiscussionLoading] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    setFilterType("all");
    setSortBy("newest");
    setHoveredPost(null);
    setExpandedPost(null);
    setDiscussionMessages([]);
    setMessageText("");
  }, [channelId]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredPosts = useMemo(() => {
    const base = filterType === "all" ? posts : posts.filter((post) => post.type === filterType);
    if (!normalizedQuery) return base;
    return base.filter((post) =>
      `${post.title || ""} ${post.content || ""}`.toLowerCase().includes(normalizedQuery)
    );
  }, [posts, filterType, normalizedQuery]);

  const sortedPosts = useMemo(() => {
    const nextPosts = [...filteredPosts];
    if (sortBy === "newest") {
      nextPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "mostLiked") {
      nextPosts.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    } else if (sortBy === "mostViewed") {
      nextPosts.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    }
    return nextPosts;
  }, [filteredPosts, sortBy]);

  const chatMessages = useMemo(() => {
    if (filterType !== "post") return [];
    return [...discussionMessages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [discussionMessages, filterType]);

  const filterTabs = [
    { id: "all", label: "All Posts", icon: "📝", count: posts.length },
    {
      id: "announcement",
      label: "Announcements",
      icon: "📢",
      count: posts.filter((post) => post.type === "announcement").length,
    },
    {
      id: "post",
      label: "Discussions",
      icon: "💬",
      count: posts.filter((post) => post.type === "post").length,
    },
  ];

  const isAdmin = user?.role === "admin";

  const handleRemoveAnnouncements = async () => {
    if (!isAdmin || !channelId) return;
    const announcements = posts.filter((post) => post.type === "announcement");
    if (announcements.length === 0) return;

    const confirmed = window.confirm(
      "Remove all announcements in this channel? This cannot be undone."
    );
    if (!confirmed) return;

    try {
      setRemovingAnnouncements(true);
      const results = await Promise.allSettled(
        announcements.map((post) => api.delete(`/api/community/posts/${post._id}`))
      );
      const removedIds = results
        .map((result, index) => (result.status === "fulfilled" ? announcements[index]._id : null))
        .filter(Boolean);
      if (removedIds.length > 0) {
        onAnnouncementsRemoved?.(removedIds);
      }
    } catch (error) {
      console.error("Error removing announcements:", error);
    } finally {
      setRemovingAnnouncements(false);
    }
  };

  const loadDiscussionMessages = async () => {
    if (!channelId) return;
    try {
      setDiscussionLoading(true);
      const response = await api.get(`/api/community/channels/${channelId}/discussions`);
      if (response.data.success) {
        setDiscussionMessages(response.data.data || []);
      }
    } catch (error) {
      console.error("Error loading discussion messages:", error);
    } finally {
      setDiscussionLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!channelId || !messageText.trim()) return;
    try {
      setSendingMessage(true);
      const response = await api.post(`/api/community/channels/${channelId}/discussions`, {
        content: messageText.trim(),
      });

      if (response.data.success) {
        setDiscussionMessages((prev) => [...prev, response.data.data]);
        setMessageText("");
      }
    } catch (error) {
      console.error("Error sending discussion message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  useEffect(() => {
    if (filterType === "post") {
      loadDiscussionMessages();
    }
  }, [filterType, channelId]);

  useEffect(() => {
    if (!socket) return;
    const handleDiscussionNew = ({ channelId: incomingChannelId, message }) => {
      if (!incomingChannelId || incomingChannelId !== channelId) return;
      setDiscussionMessages((prev) =>
        prev.some((item) => item._id === message._id) ? prev : [...prev, message]
      );
    };

    socket.on("discussion:new", handleDiscussionNew);
    return () => {
      socket.off("discussion:new", handleDiscussionNew);
    };
  }, [socket, channelId]);

  return (
    <div className="community-posts-professional">
      <div className="posts-header">
        <div className="header-controls">
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="sort-selector"
          >
            <option value="newest">🕐 Newest First</option>
            <option value="mostLiked">❤️ Most Liked</option>
            <option value="mostViewed">👁️ Most Viewed</option>
          </select>
          {isAdmin && (
            <button
              type="button"
              className="btn-clear-announcements"
              onClick={handleRemoveAnnouncements}
              disabled={removingAnnouncements}
            >
              {removingAnnouncements ? "Removing..." : "Remove Announcements"}
            </button>
          )}
        </div>
      </div>

      <div className="filter-tabs-container">
        <div className="filter-tabs-scroll">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              className={`filter-tab ${filterType === tab.id ? "active" : ""}`}
              onClick={() => setFilterType(tab.id)}
              type="button"
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              <span className="tab-count">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {filterType === "post" ? (
        <>
          <div className="chat-container">
            {discussionLoading ? (
              <div className="empty-posts">
                <div className="empty-icon">⏳</div>
                <p>Loading messages...</p>
              </div>
            ) : chatMessages.length === 0 ? (
              <div className="empty-posts">
                <div className="empty-icon">📝</div>
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              chatMessages.map((post) => {
                const isMine = post.author?._id === user?._id;
                return (
                  <div
                    key={post._id}
                    className={`chat-message ${isMine ? "mine" : ""}`}
                  >
                    <div className="chat-meta">
                      <span className="chat-author">{post.author?.name || "User"}</span>
                      <span className="chat-time">
                        {new Date(post.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="chat-bubble">
                      {post.title && <h4>{post.title}</h4>}
                      <p>{post.content}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="chat-composer">
            <input
              type="text"
              placeholder="Type a message..."
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSendMessage}
              disabled={sendingMessage}
            >
              Send
            </button>
          </div>
        </>
      ) : (
        <div className="posts-list-container">
          {loading ? (
            <div className="posts-skeleton">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-header">
                    <div className="skeleton-avatar"></div>
                    <div className="skeleton-text">
                      <div className="skeleton-line short"></div>
                      <div className="skeleton-line"></div>
                    </div>
                  </div>
                  <div className="skeleton-content">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : sortedPosts.length === 0 ? (
            <div className="empty-posts-state">
              <div className="empty-icon">📭</div>
              <h3>No posts yet</h3>
              <p>Be the first to start a discussion!</p>
            </div>
          ) : (
            sortedPosts.map((post) => (
              <PostCardProfessional
                key={post._id}
                post={post}
                user={user}
                sme={sme}
                isHovered={hoveredPost === post._id}
                isExpanded={expandedPost === post._id}
                onHover={setHoveredPost}
                onExpand={setExpandedPost}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

const PostCardProfessional = ({
  post,
  user,
  sme,
  isHovered,
  isExpanded,
  onHover,
  onExpand,
}) => {
  const [isLiked, setIsLiked] = useState(
    post.likes?.some((id) => id === user?._id || id?._id === user?._id) || false
  );
  const [likeCount, setLikeCount] = useState(post.likeCount || post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  const authorName =
    post.author?.name ||
    [post.author?.firstName, post.author?.lastName].filter(Boolean).join(" ") ||
    "User";
  const authorInitial = authorName?.[0]?.toUpperCase() || "U";

  const getTimeAgo = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const seconds = Math.floor((now - postDate) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return postDate.toLocaleDateString();
  };

  const handleLike = async () => {
    try {
      const response = await api.post(`/api/community/posts/${post._id}/like`);

      if (response.data?.success) {
        const nextLikeCount = response.data.likesCount ?? likeCount + (isLiked ? -1 : 1);
        setIsLiked(response.data.liked ?? !isLiked);
        setLikeCount(nextLikeCount);
      }
    } catch (error) {
      console.error("Error liking post:", error);
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

  const handleAddComment = async (event) => {
    event.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await api.post(`/api/community/posts/${post._id}/comments`, {
        content: newComment.trim(),
        parentCommentId: replyTo?.id || null,
      });

      if (response.data.success) {
        setComments((prev) =>
          prev.some((comment) => comment._id === response.data.data._id)
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

  const topLevelComments = comments.filter((comment) => !comment.parentComment);
  const repliesFor = (parentId) =>
    comments.filter((comment) => comment.parentComment === parentId);

  const isSMEAuthor = sme?._id === post.author?._id || sme?.email === post.author?.email;
  const isAdmin = user?.role === "admin";
  const commentCount = comments.length || post.commentCount || 0;

  return (
    <div
      className={`post-card-professional ${post.type === "announcement" ? "announcement" : ""} ${
        isHovered ? "hovered" : ""
      }`}
      onMouseEnter={() => onHover(post._id)}
      onMouseLeave={() => onHover(null)}
    >
      {post.type === "announcement" && (
        <div className="announcement-badge-premium">
          <span className="badge-icon">📢</span>
          <span className="badge-text">ANNOUNCEMENT</span>
        </div>
      )}

      {post.isPinned && (
        <div className="pinned-badge-premium">
          <span>📌 Pinned</span>
        </div>
      )}

      <div className="post-header-premium">
        <div className="author-section">
          <div className="author-avatar-premium">{authorInitial}</div>

          <div className="author-info-premium">
            <div className="author-name-row">
              <span className="author-name">{authorName}</span>
              {isSMEAuthor && <span className="sme-badge-mini">⭐ Expert</span>}
              {isAdmin && !isSMEAuthor && <span className="admin-badge-mini">👨‍💼 Admin</span>}
            </div>
            <div className="post-meta">
              <span className="time-ago">{getTimeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="post-actions-menu">
          <button className="action-menu-btn" title="More options" type="button">
            ⋯
          </button>
        </div>
      </div>

      <div className="post-content-premium">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-body">
          {isExpanded ? post.content : post.content.substring(0, 150)}
          {post.content.length > 150 && !isExpanded && "..."}
        </p>

        {post.content.length > 150 && (
          <button
            className="read-more-btn"
            onClick={() => onExpand(isExpanded ? null : post._id)}
            type="button"
          >
            {isExpanded ? "Show Less" : "Read More"}
          </button>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="post-tags-premium">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag-premium">
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="tag-more">+{post.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      <div className="post-stats-premium">
        <div className="stat-item">
          <span className="stat-icon">❤️</span>
          <span className="stat-value">{likeCount}</span>
          <span className="stat-label">Likes</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">💬</span>
          <span className="stat-value">{commentCount}</span>
          <span className="stat-label">Comments</span>
        </div>
      </div>

      <div className="post-actions-premium">
        <button
          className={`action-btn ${isLiked ? "active" : ""}`}
          onClick={handleLike}
          type="button"
        >
          <span className="action-icon">{isLiked ? "❤️" : "🤍"}</span>
          <span className="action-text">Like</span>
        </button>

        <button
          className={`action-btn ${showComments ? "active" : ""}`}
          onClick={() => {
            setShowComments((prev) => !prev);
            if (!showComments && comments.length === 0) {
              fetchComments();
            }
          }}
          type="button"
        >
          <span className="action-icon">💬</span>
          <span className="action-text">Comment</span>
        </button>

        <button className="action-btn" type="button">
          <span className="action-icon">🔗</span>
          <span className="action-text">Share</span>
        </button>

      </div>

      {showComments && (
        <div className="comments-preview">
          <div className="comments-header">
            <h4>Comments ({commentCount})</h4>
          </div>
          <form onSubmit={handleAddComment} className="comment-input-area">
            <input
              type="text"
              placeholder="Add a comment..."
              className="comment-input"
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
            />
            <button className="comment-submit" type="submit">
              {replyTo ? "Reply" : "Send"}
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

      {post.isEdited && (
        <div className="edited-indicator">
          edited {new Date(post.editedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default CommunityPostsProfessional;

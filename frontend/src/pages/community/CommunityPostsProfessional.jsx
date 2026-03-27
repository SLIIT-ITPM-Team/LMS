import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import "./CommunityPostsProfessional.css";

const getMessageKey = (message) => {
  if (!message) return null;
  return (
    message._id ||
    message.id ||
    `${message.author?._id || message.author || "anon"}-${message.createdAt || Math.random()}`
  );
};

const dedupeMessages = (messages = []) => {
  const map = new Map();
  messages.forEach((message) => {
    const key = getMessageKey(message);
    if (!key) return;
    map.set(key, message);
  });
  return Array.from(map.values());
};

const getCommentCountFromPost = (post) => {
  const value = post?.commentCount ?? post?.comments?.length ?? 0;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const CommunityPostsProfessional = ({
  channelId,
  posts,
  loading,
  user,
  sme,
  searchQuery = "",
  onAnnouncementsRemoved,
  onPostUpdated,
  onPostDeleted,
  socket,
}) => {
  const [filterType, setFilterType] = useState("all");
  const [hoveredPost, setHoveredPost] = useState(null);
  const [expandedPost, setExpandedPost] = useState(null);
  const [removingAnnouncements, setRemovingAnnouncements] = useState(false);
  const [discussionMessages, setDiscussionMessages] = useState([]);
  const [discussionLoading, setDiscussionLoading] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    setFilterType("all");
    setHoveredPost(null);
    setExpandedPost(null);
    setDiscussionMessages([]);
    setMessageText("");
  }, [channelId]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const nonAnnouncementPosts = useMemo(
    () => posts.filter((post) => post.type !== "announcement"),
    [posts]
  );

  const filteredPosts = useMemo(() => {
    const base =
      filterType === "all"
        ? nonAnnouncementPosts
        : posts.filter((post) => post.type === filterType);
    if (!normalizedQuery) return base;
    return base.filter((post) =>
      `${post.title || ""} ${post.content || ""}`.toLowerCase().includes(normalizedQuery)
    );
  }, [posts, nonAnnouncementPosts, filterType, normalizedQuery]);

  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [filteredPosts]);

  const chatMessages = useMemo(() => {
    if (filterType !== "post") return [];
    return [...discussionMessages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [discussionMessages, filterType]);

  const filterTabs = [
    { id: "all", label: "All Posts", icon: "📝", count: nonAnnouncementPosts.length },
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
        setDiscussionMessages(dedupeMessages(response.data.data || []));
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
        setDiscussionMessages((prev) => dedupeMessages([...prev, response.data.data]));
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
      setDiscussionMessages((prev) => dedupeMessages([...prev, message]));
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
                channelId={channelId}
                post={post}
                user={user}
                sme={sme}
                isHovered={hoveredPost === post._id}
                isExpanded={expandedPost === post._id}
                onHover={setHoveredPost}
                onExpand={setExpandedPost}
                onPostUpdated={onPostUpdated}
                onPostDeleted={onPostDeleted}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

const PostCardProfessional = ({
  channelId,
  post,
  user,
  sme,
  isHovered,
  isExpanded,
  onHover,
  onExpand,
  onPostUpdated,
  onPostDeleted,
}) => {
  const [isLiked, setIsLiked] = useState(
    post.likes?.some((id) => id === user?._id || id?._id === user?._id) || false
  );
  const [likeCount, setLikeCount] = useState(post.likeCount || post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title || "");
  const [editContent, setEditContent] = useState(post.content || "");
  const [editError, setEditError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const computeCommentCount = () => {
    const value = post.commentCount ?? post.comments?.length ?? 0;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  };
  const [commentCountState, setCommentCountState] = useState(() =>
    getCommentCountFromPost(post)
  );

  const authorName =
    post.author?.name ||
    [post.author?.firstName, post.author?.lastName].filter(Boolean).join(" ") ||
    "User";
  const authorInitial = authorName?.[0]?.toUpperCase() || "U";
  const content = post.content || "";
  const tags = post.tags || [];

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

  useEffect(() => {
    setEditTitle(post.title || "");
    setEditContent(post.content || "");
  }, [post._id, post.title, post.content]);

  useEffect(() => {
    setCommentCountState(getCommentCountFromPost(post));
  }, [post._id, post.commentCount, post.comments]);

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
        setCommentCountState(response.data.data?.length || 0);
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
        setCommentCountState((prev) => prev + 1);
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
  const isAuthor =
    post.author?._id?.toString?.() === user?._id?.toString?.() ||
    post.author === user?._id;
  const isOwner = isAuthor || isAdmin;
  const commentCount = commentCountState;
  const hasLongContent = content.length > 150;

  const handleUpdate = async () => {
    if (!editTitle.trim()) {
      setEditError("Title is required");
      return;
    }
    if (!editContent.trim()) {
      setEditError("Content is required");
      return;
    }

    try {
      setUpdating(true);
      const response = await api.put(`/api/community/posts/${post._id}`, {
        title: editTitle.trim(),
        content: editContent.trim(),
      });
      const updatedPost = response.data?.data ?? {
        ...post,
        title: editTitle.trim(),
        content: editContent.trim(),
        isEdited: true,
      };
      onPostUpdated?.(updatedPost);
      setIsEditing(false);
      setEditError("");
    } catch (error) {
      console.error("Error updating post:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      setDeleting(true);
      await api.delete(`/api/community/posts/${post._id}`);
      onPostDeleted?.(post._id);
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(post.title || "");
    setEditContent(post.content || "");
    setEditError("");
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const targetChannelId = channelId || post.channel?._id || "";
    const shareUrl = `${window.location.origin}/community?channel=${targetChannelId}&post=${post._id}`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        window.alert?.("Post link copied to clipboard");
      } else {
        throw new Error("Clipboard unavailable");
      }
    } catch (error) {
      console.error("Error copying post link:", error);
      window.prompt?.("Copy this post link", shareUrl);
    }
  };

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
          <span className="badge-text">📢 ANNOUNCEMENT</span>
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
          {isOwner ? (
            isEditing ? (
              <button
                className="owner-action-btn"
                type="button"
                onClick={handleCancelEdit}
                disabled={updating}
              >
                Cancel
              </button>
            ) : (
              <>
                <button
                  className="owner-action-btn"
                  type="button"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
                <button
                  className="owner-action-btn danger"
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </>
            )
          ) : (
            <button className="action-menu-btn" title="More options" type="button">
              ⋯
            </button>
          )}
        </div>
      </div>

      <div className="post-content-premium">
        {isEditing ? (
          <div className="post-edit-form">
            <input
              type="text"
              className="edit-input"
              placeholder="Title (optional)"
              value={editTitle}
              onChange={(event) => {
                setEditTitle(event.target.value);
                setEditError("");
              }}
            />
            <textarea
              className="edit-textarea"
              placeholder="What would you like to share?"
              value={editContent}
              onChange={(event) => {
                setEditContent(event.target.value);
                setEditError("");
              }}
              rows={4}
            />
            {editError && <p className="edit-error">{editError}</p>}
            <div className="edit-actions">
              <button
                type="button"
                className="owner-action-btn primary"
                onClick={handleUpdate}
                disabled={updating}
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                className="owner-action-btn"
                onClick={handleCancelEdit}
                disabled={updating}
              >
                Discard
              </button>
            </div>
          </div>
        ) : (
          <>
            {post.title && <h3 className="post-title">{post.title}</h3>}
            <p className="post-body">
              {isExpanded ? content : content.substring(0, 150)}
              {hasLongContent && !isExpanded && "..."}
            </p>

            {hasLongContent && (
              <button
                className="read-more-btn"
                onClick={() => onExpand(isExpanded ? null : post._id)}
                type="button"
              >
                {isExpanded ? "Show Less" : "Read More"}
              </button>
            )}

            {tags.length > 0 && (
              <div className="post-tags-premium">
                {tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="tag-premium">
                    #{tag}
                  </span>
                ))}
                {tags.length > 3 && <span className="tag-more">+{tags.length - 3}</span>}
              </div>
            )}
          </>
        )}
      </div>

      <div className="post-stats-premium">
        <span>❤️ {likeCount} likes</span>
        <span>💬 {commentCount} comments</span>
      </div>

      <div className="post-actions-premium">
        <button
          className={`action-btn action-like ${isLiked ? "active" : ""}`}
          onClick={handleLike}
          type="button"
        >
          <span className="action-icon">{isLiked ? "❤️" : "🤍"}</span>
          <span className="action-text">Like</span>
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
          <span className="action-icon">💬</span>
          <span className="action-text">Comment ({commentCount})</span>
        </button>

        <button className="action-btn action-share" type="button" onClick={handleShare}>
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

      {post.isEdited && post.editedAt && (
        <div className="edited-indicator">edited {new Date(post.editedAt).toLocaleDateString()}</div>
      )}
    </div>
  );
};

export default CommunityPostsProfessional;

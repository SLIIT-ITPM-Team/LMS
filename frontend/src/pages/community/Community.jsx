<<<<<<< Updated upstream
<<<<<<< HEAD
import { useState, useEffect, useContext } from 'react';
import { getChannels, getPostsByChannel, deleteChannel } from '../../api/community.api';
import { AuthContext } from '../../context/AuthContext';
import socket from '../../utils/socket';
import PostCard from '../../components/community/PostCard';
import CreatePostModal from '../../components/community/CreatePostModal';
import CreateChannelModal from '../../components/community/CreateChannelModal';

const Community = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = (user?.role || '').toLowerCase() === 'admin';

  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);

  // Load channels on mount
  useEffect(() => {
    fetchChannels();
    socket.connect();

    socket.on('channel:new', (ch) => setChannels((prev) => [ch, ...prev]));
    socket.on('channel:updated', (ch) =>
      setChannels((prev) => prev.map((c) => (c._id === ch._id ? ch : c)))
    );
    socket.on('channel:deleted', ({ id }) => {
      setChannels((prev) => prev.filter((c) => c._id !== id));
      setSelectedChannel((prev) => (prev?._id === id ? null : prev));
    });

    return () => {
      socket.off('channel:new');
      socket.off('channel:updated');
      socket.off('channel:deleted');
      socket.disconnect();
    };
  }, []);

  // Join channel room & load posts when channel changes
  useEffect(() => {
    if (!selectedChannel) return;

    socket.emit('join:channel', selectedChannel._id);
    fetchPosts(selectedChannel._id);

    // Real-time post events
    socket.on('post:new', (post) => setPosts((prev) => [post, ...prev]));
    socket.on('post:updated', (post) =>
      setPosts((prev) => prev.map((p) => (p._id === post._id ? post : p)))
    );
    socket.on('post:deleted', ({ id }) =>
      setPosts((prev) => prev.filter((p) => p._id !== id))
    );
    socket.on('post:liked', ({ postId, likes }) =>
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, likes } : p))
      )
    );

    return () => {
      socket.emit('leave:channel', selectedChannel._id);
      socket.off('post:new');
      socket.off('post:updated');
      socket.off('post:deleted');
      socket.off('post:liked');
    };
  }, [selectedChannel]);

  const fetchChannels = async () => {
    try {
      const res = await getChannels();
      setChannels(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPosts = async (channelId) => {
    setLoadingPosts(true);
    try {
      const res = await getPostsByChannel(channelId);
      setPosts(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleDeleteChannel = async (id) => {
    if (!window.confirm('Delete this channel?')) return;
    try {
      await deleteChannel(id);
    } catch (err) {
      alert('Failed to delete channel');
    }
  };

  const s = {
    page: { display: 'flex', height: 'calc(100vh - 60px)', fontFamily: 'inherit' },

    // Sidebar
    sidebar: {
      width: 260, background: '#1e1e2e', color: '#fff',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      overflow: 'hidden',
    },
    sidebarHeader: {
      padding: '20px 16px 12px',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    },
    sidebarTitle: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
    sidebarSub: { fontSize: 12, color: '#aaa' },
    createChannelBtn: {
      margin: '12px 16px', border: '1px dashed rgba(255,255,255,0.3)',
      background: 'none', color: '#aaa', borderRadius: 8,
      padding: '8px 0', cursor: 'pointer', fontSize: 13, width: 'calc(100% - 32px)',
    },
    channelList: { flex: 1, overflowY: 'auto', padding: '8px 0' },
    channelItem: (selected) => ({
      padding: '10px 16px', cursor: 'pointer',
      background: selected ? 'rgba(108,99,255,0.25)' : 'transparent',
      borderLeft: selected ? '3px solid #6c63ff' : '3px solid transparent',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }),
    channelName: { fontWeight: 600, fontSize: 14, color: '#e0e0e0' },
    channelSubject: { fontSize: 11, color: '#888', marginTop: 2 },
    channelExpert: { fontSize: 11, color: '#6c63ff', marginTop: 2 },

    // Main content
    main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f7f8fc' },
    topBar: {
      padding: '16px 24px', background: '#fff',
      borderBottom: '1px solid #eee', display: 'flex',
      justifyContent: 'space-between', alignItems: 'center',
    },
    channelTitle: { fontSize: 20, fontWeight: 700, color: '#222' },
    channelDesc: { fontSize: 13, color: '#888', marginTop: 2 },
    newPostBtn: {
      background: '#6c63ff', color: '#fff', border: 'none',
      borderRadius: 10, padding: '10px 20px', cursor: 'pointer',
      fontWeight: 600, fontSize: 14,
    },
    postsArea: { flex: 1, overflowY: 'auto', padding: '20px 24px' },
    empty: {
      textAlign: 'center', color: '#aaa', marginTop: 60,
    },
    noChannel: {
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', color: '#aaa',
    },
  };

  return (
    <div style={s.page}>
      {/* ── SIDEBAR ── */}
      <aside style={s.sidebar}>
        <div style={s.sidebarHeader}>
          <div style={s.sidebarTitle}>🏫 Community</div>
          <div style={s.sidebarSub}>Select a channel to start</div>
        </div>

        {isAdmin && (
          <button style={s.createChannelBtn} onClick={() => setShowCreateChannel(true)}>
            + New Channel
          </button>
        )}

        <div style={s.channelList}>
          {channels.length === 0 && (
            <p style={{ color: '#555', fontSize: 13, padding: '16px', textAlign: 'center' }}>
              No channels yet
            </p>
          )}
          {channels.map((ch) => (
            <div
              key={ch._id}
              style={s.channelItem(selectedChannel?._id === ch._id)}
              onClick={() => setSelectedChannel(ch)}
            >
              <div>
                <div style={s.channelName}># {ch.name}</div>
                <div style={s.channelSubject}>{ch.subject}</div>
                {ch.expert?.name && (
                  <div style={s.channelExpert}>👤 {ch.expert.name}</div>
                )}
              </div>
              {isAdmin && (
                <button
                  style={{
                    border: 'none', background: 'none', color: '#e74c3c',
                    cursor: 'pointer', fontSize: 16, padding: 0,
                  }}
                  onClick={(e) => { e.stopPropagation(); handleDeleteChannel(ch._id); }}
                  title="Delete channel"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* ── MAIN ── */}
      {!selectedChannel ? (
        <div style={s.noChannel}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👈</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Select a channel</div>
          <div style={{ fontSize: 14, marginTop: 6 }}>Choose a subject channel to view posts</div>
        </div>
      ) : (
        <div style={s.main}>
          {/* Top bar */}
          <div style={s.topBar}>
            <div>
              <div style={s.channelTitle}># {selectedChannel.name}</div>
              <div style={s.channelDesc}>
                {selectedChannel.description || selectedChannel.subject}
                {selectedChannel.expert?.name && (
                  <span style={{ marginLeft: 10, color: '#6c63ff', fontWeight: 600 }}>
                    • Expert: {selectedChannel.expert.name}
                  </span>
                )}
              </div>
            </div>
            <button style={s.newPostBtn} onClick={() => setShowCreatePost(true)}>
              + New Post
            </button>
          </div>

          {/* Posts */}
          <div style={s.postsArea}>
            {loadingPosts ? (
              <div style={s.empty}>Loading posts...</div>
            ) : posts.length === 0 ? (
              <div style={s.empty}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <div>No posts yet. Be the first to post!</div>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  channelId={selectedChannel._id}
                  onDeleted={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
                  onUpdated={(updated) =>
                    setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))
                  }
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* ── MODALS ── */}
      {showCreatePost && (
        <CreatePostModal
          channelId={selectedChannel?._id}
          onClose={() => setShowCreatePost(false)}
          onCreated={(post) => setPosts((prev) => [post, ...prev])}
        />
      )}
      {showCreateChannel && (
        <CreateChannelModal
          onClose={() => setShowCreateChannel(false)}
          onCreated={(ch) => {
            setChannels((prev) => [ch, ...prev]);
            setSelectedChannel(ch);
          }}
        />
      )}
    </div>
  );
=======
import React from 'react';

const Community = () => {
	return (
		<div className="min-h-screen bg-slate-50 px-4 py-24 md:px-8">
			<div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
				<h1 className="text-2xl font-bold text-slate-900">Community</h1>
				<p className="mt-2 text-sm text-slate-600">Connect with classmates and discuss modules.</p>
			</div>
		</div>
	);
>>>>>>> Development
};

=======
import React from 'react';

const Community = () => {
	return (
		<div className="min-h-screen bg-slate-50 px-4 py-24 md:px-8">
			<div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
				<h1 className="text-2xl font-bold text-slate-900">Community</h1>
				<p className="mt-2 text-sm text-slate-600">Connect with classmates and discuss modules.</p>
			</div>
		</div>
	);
};

>>>>>>> Stashed changes
export default Community;

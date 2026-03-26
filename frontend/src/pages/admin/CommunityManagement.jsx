import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2, Edit3, Megaphone } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";

const emptyForm = {
  name: "",
  description: "",
  topic: "",
  subject: "",
  icon: "",
  coverImage: "",
  expertName: "",
  expertTitle: "",
};

const emptyAnnouncement = {
  title: "",
  content: "",
};

const CommunityManagement = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedChannelId, setSelectedChannelId] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [annLoading, setAnnLoading] = useState(false);
  const [annModalOpen, setAnnModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announcementForm, setAnnouncementForm] = useState(emptyAnnouncement);


  const filteredChannels = useMemo(() => {
    if (!query.trim()) return channels;
    const needle = query.toLowerCase();
    return channels.filter((channel) =>
      `${channel.name} ${channel.subject} ${channel.description}`
        .toLowerCase()
        .includes(needle)
    );
  }, [channels, query]);

  const loadChannels = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/community/channels", {
        params: { search: query || undefined, limit: 50 },
      });
      setChannels(response.data.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load channels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChannels();
  }, []);

  useEffect(() => {
    if (channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0]._id);
    }
  }, [channels, selectedChannelId]);

  const openCreate = () => {
    setEditingChannel(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (channel) => {
    setEditingChannel(channel);
    setForm({
      name: channel.name || "",
      description: channel.description || "",
      topic: channel.topic || "",
      subject: channel.subject || "",
      icon: channel.icon || "",
      coverImage: channel.coverImage || "",
      expertName: channel.expert?.name || "",
      expertTitle: channel.expert?.title || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name || !form.description || !form.topic || !form.subject) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setSaving(true);
      if (editingChannel) {
        const response = await api.put(`/api/community/channels/${editingChannel._id}`, form);
        const updated = response.data.data;
        setChannels((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
        toast.success("Channel updated");
      } else {
        const response = await api.post("/api/community/channels", form);
        setChannels((prev) => [response.data.data, ...prev]);
        toast.success("Channel created");
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save channel");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (channelId) => {
    if (!window.confirm("Delete this channel?")) return;
    try {
      await api.delete(`/api/community/channels/${channelId}`);
      setChannels((prev) => prev.filter((channel) => channel._id !== channelId));
      toast.success("Channel deleted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete channel");
    }
  };

  const loadAnnouncements = async (channelId) => {
    if (!channelId) return;
    try {
      setAnnLoading(true);
      const response = await api.get(`/api/community/channels/${channelId}/posts`);
      const items = response.data.data || [];
      setAnnouncements(items.filter((post) => post.type === "announcement"));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load announcements");
    } finally {
      setAnnLoading(false);
    }
  };

  const openAnnouncementModal = (announcement = null) => {
    setEditingAnnouncement(announcement);
    setAnnouncementForm({
      title: announcement?.title || "",
      content: announcement?.content || "",
    });
    setAnnModalOpen(true);
  };

  const handleAnnouncementSubmit = async (event) => {
    event.preventDefault();
    if (!selectedChannelId) {
      toast.error("Select a channel first");
      return;
    }
    if (!announcementForm.content.trim()) {
      toast.error("Content is required");
      return;
    }

    try {
      if (editingAnnouncement) {
        const response = await api.put(`/api/community/posts/${editingAnnouncement._id}`, {
          title: announcementForm.title,
          content: announcementForm.content,
        });
        const updated = response.data.data;
        setAnnouncements((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
        toast.success("Announcement updated");
      } else {
        const response = await api.post("/api/community/posts", {
          channelId: selectedChannelId,
          title: announcementForm.title,
          content: announcementForm.content,
          type: "announcement",
        });
        setAnnouncements((prev) => [response.data.data, ...prev]);
        toast.success("Announcement created");
      }

      setAnnModalOpen(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save announcement");
    }
  };

  const handleAnnouncementDelete = async (postId) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await api.delete(`/api/community/posts/${postId}`);
      setAnnouncements((prev) => prev.filter((p) => p._id !== postId));
      toast.success("Announcement deleted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete announcement");
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 px-4 py-24 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Community Channels</h1>
            <p className="mt-1 text-sm text-slate-500">
              Create, edit, and delete community channels. Only admins can manage channels.
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-200"
            onClick={openCreate}
            type="button"
          >
            <Plus size={16} /> New Channel
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Search size={18} className="text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search channels"
            className="w-full text-sm text-slate-700 outline-none"
          />
          <button
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
            type="button"
            onClick={loadChannels}
          >
            Search
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-6 text-sm text-slate-500">Loading channels...</div>
          ) : filteredChannels.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">No channels found.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Topic</th>
                  <th className="px-5 py-3">Members</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredChannels.map((channel) => (
                  <tr key={channel._id} className="border-t border-slate-100">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{channel.name}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{channel.description}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{channel.subject}</td>
                    <td className="px-5 py-4 text-slate-600">{channel.topic || "-"}</td>
                    <td className="px-5 py-4 text-slate-600">{channel.memberCount || 0}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                          onClick={() => openEdit(channel)}
                          type="button"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50"
                          onClick={() => handleDelete(channel._id)}
                          type="button"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Announcements</h2>
              <p className="text-sm text-slate-500">Create, edit, and delete announcements per channel.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={selectedChannelId}
                onChange={(event) => {
                  setSelectedChannelId(event.target.value);
                  loadAnnouncements(event.target.value);
                }}
              >
                {channels.map((channel) => (
                  <option key={channel._id} value={channel._id}>
                    {channel.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-200"
                onClick={() => openAnnouncementModal()}
              >
                <Megaphone size={16} /> New Announcement
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
                onClick={() => loadAnnouncements(selectedChannelId)}
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-slate-100">
            {annLoading ? (
              <div className="p-4 text-sm text-slate-500">Loading announcements...</div>
            ) : announcements.length === 0 ? (
              <div className="p-4 text-sm text-slate-500">No announcements yet.</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Content</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {announcements.map((announcement) => (
                    <tr key={announcement._id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {announcement.title || "(No title)"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 line-clamp-1">
                        {announcement.content}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                            onClick={() => openAnnouncementModal(announcement)}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50"
                            onClick={() => handleAnnouncementDelete(announcement._id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingChannel ? "Edit Channel" : "Create Channel"}
                </h2>
                <p className="text-xs text-slate-500">
                  Fields marked with * are required.
                </p>
              </div>
              <button
                type="button"
                className="rounded-full border border-slate-200 px-2 py-1 text-xs"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>

            <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-xs font-semibold text-slate-600">
                  Name *
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                  />
                </label>
                <label className="text-xs font-semibold text-slate-600">
                  Topic *
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.topic}
                    onChange={(event) => setForm({ ...form, topic: event.target.value })}
                  />
                </label>
              </div>

              <label className="text-xs font-semibold text-slate-600">
                Subject *
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={form.subject}
                  onChange={(event) => setForm({ ...form, subject: event.target.value })}
                />
              </label>

              <label className="text-xs font-semibold text-slate-600">
                Description *
                <textarea
                  rows="3"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                />
              </label>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-xs font-semibold text-slate-600">
                  Icon URL
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.icon}
                    onChange={(event) => setForm({ ...form, icon: event.target.value })}
                  />
                </label>
                <label className="text-xs font-semibold text-slate-600">
                  Cover Image URL
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.coverImage}
                    onChange={(event) => setForm({ ...form, coverImage: event.target.value })}
                  />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-xs font-semibold text-slate-600">
                  Lecturer Name
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.expertName}
                    onChange={(event) => setForm({ ...form, expertName: event.target.value })}
                    placeholder="e.g., Dr. Silva"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-600">
                  Lecturer Position
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.expertTitle}
                    onChange={(event) => setForm({ ...form, expertTitle: event.target.value })}
                    placeholder="e.g., Senior Lecturer"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="mt-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white"
                disabled={saving}
              >
                {saving ? "Saving..." : editingChannel ? "Update Channel" : "Create Channel"}
              </button>
            </form>
          </div>
        </div>
      )}

      {annModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingAnnouncement ? "Edit Announcement" : "Create Announcement"}
                </h2>
                <p className="text-xs text-slate-500">
                  Announcement will be posted to the selected channel.
                </p>
              </div>
              <button
                type="button"
                className="rounded-full border border-slate-200 px-2 py-1 text-xs"
                onClick={() => setAnnModalOpen(false)}
              >
                Close
              </button>
            </div>

            <form className="mt-4 grid gap-4" onSubmit={handleAnnouncementSubmit}>
              <label className="text-xs font-semibold text-slate-600">
                Title
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={announcementForm.title}
                  onChange={(event) => setAnnouncementForm({ ...announcementForm, title: event.target.value })}
                />
              </label>

              <label className="text-xs font-semibold text-slate-600">
                Content *
                <textarea
                  rows="4"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={announcementForm.content}
                  onChange={(event) => setAnnouncementForm({ ...announcementForm, content: event.target.value })}
                />
              </label>

              <button
                type="submit"
                className="mt-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white"
              >
                {editingAnnouncement ? "Update Announcement" : "Create Announcement"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityManagement;

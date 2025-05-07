import { useState, useEffect } from 'react';

export default function CreateTeamBox() {
  const [form, setForm] = useState({
    name: '',
    username: '',
    bio: '',
    userId: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [status, setStatus] = useState({ error: '', success: '' });

  useEffect(() => {
    const id = localStorage.getItem('user_id');
    if (id) setForm((prev) => ({ ...prev, userId: id }));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ error: '', success: '' });

    try {
      const data = new FormData();
      data.append('name', form.name);
      data.append('username', form.username);
      data.append('bio', form.bio);
      data.append('userId', form.userId);
      if (avatarFile) data.append('avatar', avatarFile);

      const res = await fetch('http://localhost:5000/api/team-boxes', {
        method: 'POST',
        body: data,
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        setStatus({ error: result.error || 'Failed to create.', success: '' });
      } else {
        setStatus({ error: '', success: 'TeamBox created.' });
        setForm((prev) => ({ name: '', username: '', bio: '', userId: prev.userId }));
        setAvatarFile(null);
        setAvatarPreview('');
      }
    } catch (err) {
      setStatus({ error: 'Something went wrong.', success: '' });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Create TeamBox</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Team Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded-md border bg-gray-100 dark:bg-gray-700 dark:text-white"
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded-md border bg-gray-100 dark:bg-gray-700 dark:text-white"
        />
        <textarea
          name="bio"
          placeholder="Bio"
          value={form.bio}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 rounded-md border bg-gray-100 dark:bg-gray-700 dark:text-white"
        />
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
          Upload Profile Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-500"
        />
        {avatarPreview && (
          <img
            src={avatarPreview}
            alt="Avatar Preview"
            className="w-24 h-24 rounded-full object-cover mx-auto mt-2"
          />
        )}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
        >
          Create
        </button>
        {status.error && <p className="text-red-500 text-center">{status.error}</p>}
        {status.success && <p className="text-green-600 text-center">{status.success}</p>}
      </form>
    </div>
  );
}

const API_BASE = 'http://localhost:5000/api';

export const signup = async (data) => {
  const res = await fetch(`${API_BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};
// ../api.js
export const createPost = async (data) => {
  try {
    const res = await fetch(`${API_BASE}/newpost`, {
      method: 'POST',
      body: data,
    });
    return await res.json();
  } catch (err) {
    return { error: 'Failed to create post.' };
  }
};


export const login = async (data) => {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getProfile = async (token) => {
  const res = await fetch(`${API_BASE}/profile`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

export const resendOtp = async (data) => {
  const res = await fetch(`${API_BASE}/resend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const verifyOtp = async (data) => {
  const res = await fetch(`${API_BASE}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

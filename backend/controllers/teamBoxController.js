const { TeamBox } = require('../models');
const fs = require('fs');
const path = require('path');

// Utils
const getAvatarPath = (filename) => `/uploads/TeamProfile/${filename}`;
const getFullPath = (relativePath) => path.join('.', relativePath);

// Create
const createTeamBox = async (req, res) => {
  try {
    const { name, username, bio, userId } = req.body;
    const avatar = req.file ? getAvatarPath(req.file.filename) : null;

    if (!name || !username || !userId) {
      return res.status(400).json({ message: 'name, username, and userId are required.' });
    }

    const existing = await TeamBox.findOne({ where: { username } });
    if (existing) {
      return res.status(409).json({ message: 'username already taken.' });
    }

    const teamBox = await TeamBox.create({ name, username, bio, avatar, userId });
    return res.status(201).json(teamBox);
  } catch (err) {
    console.error('Create error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Update
const updateTeamBox = async (req, res) => {
  try {
    const { id, name, username, bio } = req.body;
    const teamBox = await TeamBox.findByPk(id);
    if (!teamBox) return res.status(404).json({ message: 'TeamBox not found.' });

    if (req.file) {
      if (teamBox.avatar && fs.existsSync(getFullPath(teamBox.avatar))) {
        fs.unlinkSync(getFullPath(teamBox.avatar));
      }
      teamBox.avatar = getAvatarPath(req.file.filename);
    }

    teamBox.name = name || teamBox.name;
    teamBox.username = username || teamBox.username;
    teamBox.bio = bio || teamBox.bio;

    await teamBox.save();
    res.json(teamBox);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Error updating TeamBox.', error: err.message });
  }
};

// Delete
const deleteTeamBox = async (req, res) => {
  try {
    const { id } = req.body;
    const teamBox = await TeamBox.findByPk(id);
    if (!teamBox) return res.status(404).json({ message: 'TeamBox not found.' });

    if (teamBox.avatar && fs.existsSync(getFullPath(teamBox.avatar))) {
      fs.unlinkSync(getFullPath(teamBox.avatar));
    }

    await teamBox.destroy();
    res.json({ message: 'TeamBox deleted.' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Error deleting TeamBox.', error: err.message });
  }
};

// List
const listTeamBoxes = async (_req, res) => {
  try {
    const teamBoxes = await TeamBox.findAll();
    res.json(teamBoxes);
  } catch (err) {
    console.error('List error:', err);
    res.status(500).json({ message: 'Error fetching TeamBoxes.', error: err.message });
  }
};

module.exports = {
  createTeamBox,
  updateTeamBox,
  deleteTeamBox,
  listTeamBoxes,
};

const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Project = require('../models/Project');

const router = express.Router();

// Create a new project
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = new Project({
      name,
      description,
      owner: req.userId,
      members: [req.userId]
    });

    await project.save();

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all projects for the current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({ members: req.userId })
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.json({
      message: 'Projects retrieved successfully',
      projects
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single project by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .populate({
        path: 'boards',
        populate: {
          path: 'lists',
          populate: {
            path: 'cards',
            populate: 'assignedTo'
          }
        }
      });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is a member
    if (!project.members.some(member => member._id.toString() === req.userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      message: 'Project retrieved successfully',
      project
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a project
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the owner can update this project' });
    }

    const { name, description } = req.body;

    if (name) project.name = name;
    if (description) project.description = description;
    project.updatedAt = Date.now();

    await project.save();

    res.json({
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a project
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the owner can delete this project' });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Project deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a member to project
router.post('/:id/members', authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    const User = require('../models/User');

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the owner
    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the owner can add members' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already a member
    if (project.members.includes(user._id)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    project.members.push(user._id);
    await project.save();

    res.json({
      message: 'Member added successfully',
      project
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
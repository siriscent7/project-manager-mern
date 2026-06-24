const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Board = require('../models/Board');
const Project = require('../models/Project');

const router = express.Router();

// Create a new board
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, projectId } = req.body;

    if (!name || !projectId) {
      return res.status(400).json({ message: 'Board name and project ID are required' });
    }

    // Verify project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.members.includes(req.userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const board = new Board({
      name,
      project: projectId
    });

    await board.save();

    // Add board to project
    project.boards.push(board._id);
    await project.save();

    res.status(201).json({
      message: 'Board created successfully',
      board
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a board with all lists and cards
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate({
        path: 'lists',
        populate: {
          path: 'cards',
          populate: 'assignedTo'
        }
      });

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    res.json({
      message: 'Board retrieved successfully',
      board
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a board
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Remove board from project
    await Project.findByIdAndUpdate(board.project, {
      $pull: { boards: board._id }
    });

    await Board.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Board deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
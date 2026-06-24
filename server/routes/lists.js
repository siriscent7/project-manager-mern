const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const List = require('../models/List');
const Board = require('../models/Board');

const router = express.Router();

// Create a new list
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, boardId } = req.body;

    if (!name || !boardId) {
      return res.status(400).json({ message: 'List name and board ID are required' });
    }

    const list = new List({
      name,
      board: boardId
    });

    await list.save();

    // Add list to board
    await Board.findByIdAndUpdate(boardId, {
      $push: { lists: list._id }
    });

    res.status(201).json({
      message: 'List created successfully',
      list
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a list
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Remove list from board
    await Board.findByIdAndUpdate(list.board, {
      $pull: { lists: list._id }
    });

    await List.findByIdAndDelete(req.params.id);

    res.json({
      message: 'List deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Card = require('../models/Card');
const List = require('../models/List');

const router = express.Router();

// Create a new card
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, listId, priority, assignedTo, dueDate } = req.body;

    if (!title || !listId) {
      return res.status(400).json({ message: 'Card title and list ID are required' });
    }

    const card = new Card({
      title,
      description,
      list: listId,
      priority,
      assignedTo,
      dueDate
    });

    await card.save();

    // Add card to list
    await List.findByIdAndUpdate(listId, {
      $push: { cards: card._id }
    });

    res.status(201).json({
      message: 'Card created successfully',
      card
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a card
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name email');

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    res.json({
      message: 'Card retrieved successfully',
      card
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a card
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, priority, completed } = req.body;

    const card = await Card.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        assignedTo,
        dueDate,
        priority,
        completed,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('assignedTo', 'name email');

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    res.json({
      message: 'Card updated successfully',
      card
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/move', authMiddleware, async (req, res) => {
  try {
    const { newListId, position } = req.body;
    const List = require('../models/List');

    // Get the card first to find the old list
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    const oldListId = card.list;

    // Remove card from old list
    await List.findByIdAndUpdate(oldListId, {
      $pull: { cards: card._id }
    });

    // Add card to new list
    await List.findByIdAndUpdate(newListId, {
      $push: { cards: card._id }
    });

    // Update the card's list reference
    const updatedCard = await Card.findByIdAndUpdate(
      req.params.id,
      {
        list: newListId,
        position
      },
      { new: true }
    ).populate('assignedTo');

    res.json({
      message: 'Card moved successfully',
      card: updatedCard
    });
  } catch (error) {
    console.error('Move error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add comment to card
router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const card = await Card.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            user: req.userId,
            text
          }
        }
      },
      { new: true }
    ).populate('comments.user', 'name email');

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    res.json({
      message: 'Comment added successfully',
      card
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a card
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Remove card from list
    await List.findByIdAndUpdate(card.list, {
      $pull: { cards: card._id }
    });

    await Card.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Card deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
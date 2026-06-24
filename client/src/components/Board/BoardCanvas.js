import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../../services/api';

const BoardCanvas = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newListName, setNewListName] = useState('');
  const [error, setError] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardComment, setCardComment] = useState('');

  useEffect(() => {
    fetchBoard();
  }, [boardId]);

  const fetchBoard = async () => {
    try {
      const response = await api.getBoard(boardId);
      setBoard(response.data.board);
    } catch (err) {
      setError('Failed to fetch board');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    try {
      const response = await api.createList(newListName, boardId);
      setBoard({
        ...board,
        lists: [...(board.lists || []), response.data.list]
      });
      setNewListName('');
    } catch (err) {
      setError('Failed to create list');
    }
  };

  const handleCreateCard = async (listId) => {
    const title = prompt('Card title:');
    if (!title) return;
    
    const priority = prompt('Priority?\n\nEnter: low, medium, or high', 'medium');
    
    if (!['low', 'medium', 'high'].includes(priority)) {
      alert('Invalid priority. Using medium.');
    }
    
    try {
      const response = await api.createCard(title, '', listId, priority || 'medium');
      const updatedLists = board.lists.map((list) => {
        if (list._id === listId) {
          return { ...list, cards: [...(list.cards || []), response.data.card] };
        }
        return list;
      });
      setBoard({ ...board, lists: updatedLists });
    } catch (err) {
      setError('Failed to create card');
    }
  };

  const handleMoveCard = async (cardId, currentListId, newListId) => {
    console.log('Moving card:', cardId, 'from', currentListId, 'to', newListId);

    if (currentListId === newListId) {
      alert('Card is already in this list');
      return;
    }

    try {
      console.log('Calling API to move card...');
      const response = await api.moveCard(cardId, newListId, 0);
      console.log('API response:', response);
      
      alert('Card moved!');
      await fetchBoard();
    } catch (err) {
      console.error('Move card error:', err);
      setError('Failed to move card: ' + err.message);
    }
  };

  const handleDeleteCard = async (listId, cardId) => {
    if (window.confirm('Delete this card?')) {
      try {
        await api.deleteCard(cardId);
        const updatedLists = board.lists.map((list) => {
          if (list._id === listId) {
            return { ...list, cards: list.cards.filter(c => c._id !== cardId) };
          }
          return list;
        });
        setBoard({ ...board, lists: updatedLists });
        setSelectedCard(null);
      } catch (err) {
        setError('Failed to delete card');
      }
    }
  };

  const handleAddComment = async () => {
    if (!cardComment.trim() || !selectedCard) return;

    try {
      const response = await api.addComment(selectedCard._id, cardComment);
      const updatedLists = board.lists.map((list) => {
        return {
          ...list,
          cards: list.cards.map((card) =>
            card._id === selectedCard._id ? response.data.card : card
          )
        };
      });
      setBoard({ ...board, lists: updatedLists });
      setSelectedCard(response.data.card);
      setCardComment('');
    } catch (err) {
      setError('Failed to add comment');
    }
  };

  const handleDeleteList = async (listId) => {
    if (window.confirm('Delete this list and all its cards?')) {
      try {
        await api.deleteList(listId);
        setBoard({
          ...board,
          lists: board.lists.filter(l => l._id !== listId)
        });
      } catch (err) {
        setError('Failed to delete list');
      }
    }
  };

  const handleToggleCardCompletion = async (cardId, completed) => {
    try {
      const response = await api.updateCard(cardId, { completed });
      const updatedLists = board.lists.map((list) => {
        return {
          ...list,
          cards: list.cards.map((card) =>
            card._id === cardId ? response.data.card : card
          )
        };
      });
      setBoard({ ...board, lists: updatedLists });
      if (selectedCard?._id === cardId) {
        setSelectedCard(response.data.card);
      }
    } catch (err) {
      setError('Failed to update card');
    }
  };

  const handleUpdateCardPriority = async (cardId, newPriority) => {
    try {
      const response = await api.updateCard(cardId, { priority: newPriority });
      const updatedLists = board.lists.map((list) => {
        return {
          ...list,
          cards: list.cards.map((card) =>
            card._id === cardId ? response.data.card : card
          )
        };
      });
      setBoard({ ...board, lists: updatedLists });
      setSelectedCard(response.data.card);
    } catch (err) {
      setError('Failed to update card');
    }
  };

  if (loading) return <div style={{ padding: '1.5rem' }}>Loading...</div>;

  if (!board) return <div style={{ padding: '1.5rem' }}>Board not found</div>;

  // Calculate progress
  const allCards = board.lists ? board.lists.flatMap(list => list.cards || []) : [];
  const completedCards = allCards.filter(card => card.completed).length;
  const totalCards = allCards.length;
  const percentage = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '1.5rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4b5563',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            ← Back
          </button>
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          {board.name}
        </h1>

        {/* Progress Bar */}
        {totalCards > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
              fontSize: '0.875rem'
            }}>
              <span style={{ fontWeight: 'bold' }}>Board Progress</span>
              <span style={{ fontWeight: 'bold' }}>
                {percentage}% Complete ({completedCards}/{totalCards})
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '24px',
              backgroundColor: '#e5e7eb',
              borderRadius: '0.5rem',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${percentage}%`,
                height: '100%',
                backgroundColor: percentage === 100 ? '#22c55e' : '#3b82f6',
                transition: 'width 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {percentage > 0 && `${percentage}%`}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '0.75rem',
            borderRadius: '0.25rem',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleCreateList} style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="New list name..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.25rem',
                outline: 'none',
                fontSize: '1rem'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Add List
            </button>
          </div>
        </form>

        {/* Lists */}
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          {board.lists && board.lists.length > 0 ? (
            board.lists.map((list) => (
              <div
                key={list._id}
                style={{
                  backgroundColor: 'white',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  minWidth: '300px',
                  flexShrink: 0,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{list.name}</h3>
                  <button
                    onClick={() => handleDeleteList(list._id)}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#ef4444',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.25rem'
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ minHeight: '400px', backgroundColor: '#f9fafb', borderRadius: '0.25rem', padding: '0.5rem' }}>
                  {list.cards && list.cards.length > 0 ? (
                    list.cards.map((card) => (
                      <div
                        key={card._id}
                        style={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e5e7eb',
                          padding: '0.75rem',
                          marginBottom: '0.5rem',
                          borderRadius: '0.25rem',
                          opacity: card.completed ? 0.6 : 1,
                          boxShadow: selectedCard?._id === card._id ? '0 0 0 2px #3b82f6' : 'none'
                        }}
                      >
                        <div
                          onClick={() => setSelectedCard(card)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <input
                              type="checkbox"
                              checked={card.completed || false}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleToggleCardCompletion(card._id, e.target.checked);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              style={{ cursor: 'pointer' }}
                            />
                            <p style={{
                              fontWeight: '500',
                              fontSize: '0.9rem',
                              textDecoration: card.completed ? 'line-through' : 'none',
                              color: card.completed ? '#9ca3af' : '#000',
                              flex: 1
                            }}>
                              {card.title}
                            </p>
                          </div>

                          {card.priority && (
                            <span
                              style={{
                                fontSize: '0.65rem',
                                padding: '0.2rem 0.4rem',
                                borderRadius: '0.25rem',
                                display: 'inline-block',
                                backgroundColor:
                                  card.priority === 'high'
                                    ? '#fee2e2'
                                    : card.priority === 'medium'
                                    ? '#fef3c7'
                                    : '#dcfce7',
                                color:
                                  card.priority === 'high'
                                    ? '#991b1b'
                                    : card.priority === 'medium'
                                    ? '#92400e'
                                    : '#166534',
                                marginRight: '0.25rem'
                              }}
                            >
                              {card.priority}
                            </span>
                          )}

                          {card.assignedTo && (
                            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                              👤 {card.assignedTo.name}
                            </p>
                          )}
                        </div>

                        {/* Move Card Buttons */}
                        <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                          {board.lists.map((otherList) => {
                            if (otherList._id === list._id) return null;
                            return (
                              <button
                                key={otherList._id}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onClick={(e) => {
                                  console.log('Move button clicked for:', otherList.name);
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleMoveCard(card._id, list._id, otherList._id);
                                }}
                                style={{
                                  fontSize: '0.65rem',
                                  padding: '0.2rem 0.4rem',
                                  backgroundColor: '#dbeafe',
                                  color: '#1e40af',
                                  border: '1px solid #1e40af',
                                  borderRadius: '0.2rem',
                                  cursor: 'pointer',
                                  fontWeight: 'bold'
                                }}
                              >
                                → {otherList.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No cards yet</p>
                  )}
                </div>

                <button
                  onClick={() => handleCreateCard(list._id)}
                  style={{
                    marginTop: '1rem',
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#e5e7eb',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  + Add Card
                </button>
              </div>
            ))
          ) : (
            <div style={{ color: '#6b7280' }}>No lists yet. Create one to get started!</div>
          )}
        </div>
      </div>

      {/* Card Details Modal */}
      {selectedCard && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            maxWidth: '28rem',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                <input
                  type="checkbox"
                  checked={selectedCard.completed || false}
                  onChange={(e) => handleToggleCardCompletion(selectedCard._id, e.target.checked)}
                  style={{ cursor: 'pointer', width: '1.25rem', height: '1.25rem' }}
                />
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  textDecoration: selectedCard.completed ? 'line-through' : 'none',
                  color: selectedCard.completed ? '#9ca3af' : '#000'
                }}>
                  {selectedCard.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedCard(null)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.5rem'
                }}
              >
                ✕
              </button>
            </div>

            {selectedCard.description && (
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>{selectedCard.description}</p>
            )}

            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Priority:</strong>{' '}
              <select
                value={selectedCard.priority}
                onChange={(e) => handleUpdateCardPriority(selectedCard._id, e.target.value)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  border: '1px solid #d1d5db',
                  outline: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </p>

            {selectedCard.assignedTo && (
              <p style={{ marginBottom: '1rem' }}>
                <strong>Assigned to:</strong> {selectedCard.assignedTo.name}
              </p>
            )}

            {selectedCard.dueDate && (
              <p style={{ marginBottom: '1rem' }}>
                <strong>Due Date:</strong> {new Date(selectedCard.dueDate).toLocaleDateString()}
              </p>
            )}

            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Comments ({selectedCard.comments?.length || 0})
              </h3>

              <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '1rem' }}>
                {selectedCard.comments && selectedCard.comments.length > 0 ? (
                  selectedCard.comments.map((comment, idx) => (
                    <div key={idx} style={{ backgroundColor: '#f3f4f6', padding: '0.5rem', borderRadius: '0.25rem', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                      <p style={{ fontWeight: '600', fontSize: '0.75rem', color: '#6b7280' }}>
                        {comment.user.name}
                      </p>
                      <p>{comment.text}</p>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No comments yet</p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={cardComment}
                  onChange={(e) => setCardComment(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={handleAddComment}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Add
                </button>
              </div>

              <button
                onClick={() => handleDeleteCard(selectedCard.list, selectedCard._id)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Delete Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardCanvas;
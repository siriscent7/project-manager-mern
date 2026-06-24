import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../../services/api';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newBoardName, setNewBoardName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await api.getProject(projectId);
      setProject(response.data.project);
    } catch (err) {
      setError('Failed to fetch project');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    try {
      const response = await api.createBoard(newBoardName, projectId);
      setProject({
        ...project,
        boards: [...(project.boards || []), response.data.board]
      });
      setNewBoardName('');
    } catch (err) {
      setError('Failed to create board');
    }
  };

  const handleDeleteBoard = async (boardId) => {
    if (window.confirm('Delete this board and all its lists/cards?')) {
      try {
        await api.deleteBoard(boardId);
        setProject({
          ...project,
          boards: project.boards.filter(b => b._id !== boardId)
        });
      } catch (err) {
        setError('Failed to delete board');
      }
    }
  };

  if (loading) return <div style={{ padding: '1.5rem' }}>Loading...</div>;

  if (!project) return <div style={{ padding: '1.5rem' }}>Project not found</div>;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer'
          }}
        >
          ← Back to Projects
        </button>
      </div>

      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
        {project.name}
      </h1>

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

      <form onSubmit={handleCreateBoard} style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="New board name..."
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            style={{
              flex: 1,
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
            Create Board
          </button>
        </div>
      </form>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '1rem'
      }}>
        {project.boards && project.boards.length > 0 ? (
          project.boards.map((board) => (
            <div
              key={board._id}
              style={{
                border: '1px solid #d1d5db',
                padding: '1rem',
                borderRadius: '0.5rem',
                backgroundColor: 'white'
              }}
            >
              <div
                onClick={() => navigate(`/board/${board._id}`)}
                style={{ cursor: 'pointer', marginBottom: '0.5rem' }}
              >
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                  {board.name}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  {board.lists?.length || 0} lists
                </p>
              </div>
              <button
                onClick={() => handleDeleteBoard(board._id)}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.25rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  width: '100%'
                }}
              >
                Delete Board
              </button>
            </div>
          ))
        ) : (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            color: '#6b7280',
            padding: '2rem'
          }}>
            No boards yet. Create one to get started!
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
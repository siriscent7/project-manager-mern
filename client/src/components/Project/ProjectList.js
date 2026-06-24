import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../../services/api';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProjectName, setNewProjectName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.getProjects();
      setProjects(response.data.projects);
    } catch (err) {
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const response = await api.createProject(newProjectName, '');
      setProjects([...projects, response.data.project]);
      setNewProjectName('');
    } catch (err) {
      setError('Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.deleteProject(projectId);
        setProjects(projects.filter(p => p._id !== projectId));
      } catch (err) {
        setError('Failed to delete project');
      }
    }
  };

  if (loading) return <div style={{ padding: '1.5rem' }}>Loading...</div>;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>My Projects</h1>

      {error && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.25rem', marginBottom: '1rem' }}>{error}</div>}

      <form onSubmit={handleCreateProject} style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="New project name..."
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            style={{ flex: 1, padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', outline: 'none' }}
          />
          <button
            type="submit"
            style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }}
          >
            Create Project
          </button>
        </div>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {projects.map((project) => (
          <div key={project._id} style={{ border: '1px solid #d1d5db', padding: '1rem', borderRadius: '0.5rem' }}>
            <Link to={`/project/${project._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{project.name}</h2>
              <p style={{ color: '#6b7280' }}>{project.description}</p>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>{project.boards?.length || 0} boards</p>
            </Link>
            <button
              onClick={() => handleDeleteProject(project._id)}
              style={{ marginTop: '0.75rem', backgroundColor: '#dc2626', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div style={{ textAlign: 'center', color: '#6b7280', paddingTop: '3rem' }}>
          <p>No projects yet. Create one to get started!</p>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
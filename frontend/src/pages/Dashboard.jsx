// frontend/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { tasks, teams } from '../utils/api'

export default function Dashboard() {
  const [taskList, setTaskList] = useState([])
  const [teamList, setTeamList] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ status: '', priority: '' })
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [filter])

  const fetchData = async () => {
    try {
      const [tasksRes, teamsRes] = await Promise.all([
        tasks.getAll(filter),
        teams.getAll(),
      ])
      setTaskList(tasksRes.data.tasks)
      setTeamList(teamsRes.data.teams)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    try {
      await tasks.create({
        title: formData.get('title'),
        description: formData.get('description'),
        status: formData.get('status'),
        priority: formData.get('priority'),
        teamId: parseInt(formData.get('teamId')),
      })
      setShowCreateTask(false)
      fetchData()
      e.target.reset()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create task')
    }
  }

  const handleCreateTeam = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    try {
      await teams.create({
        name: formData.get('name'),
        description: formData.get('description'),
      })
      setShowCreateTeam(false)
      fetchData()
      e.target.reset()
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create team')
    }
  }

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await tasks.update(taskId, updates)
      fetchData()
    } catch (error) {
      alert('Failed to update task')
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasks.delete(taskId)
        fetchData()
      } catch (error) {
        alert('Failed to delete task')
      }
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7fafc' }}>
      {/* Header */}
      <header
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '1.5rem 2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1
            style={{
              margin: '0 0 0.25rem 0',
              fontSize: '1.75rem',
              color: 'white',
              fontWeight: '700',
            }}
          >
            ✓ Task Manager
          </h1>
          <p
            style={{
              margin: 0,
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.9rem',
            }}
          >
            Organize your work, boost productivity
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              textAlign: 'right',
              paddingRight: '1rem',
              borderRight: '2px solid rgba(255,255,255,0.3)',
            }}
          >
            <div
              style={{ color: 'white', fontWeight: '600', fontSize: '0.95rem' }}
            >
              {user?.firstName} {user?.lastName}
            </div>
            <div
              style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}
            >
              {user?.email}
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              transition: 'all 0.2s',
              backdropFilter: 'blur(10px)',
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.3)'
              e.target.style.borderColor = 'rgba(255,255,255,0.5)'
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'
              e.target.style.borderColor = 'rgba(255,255,255,0.3)'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Stats Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
            <div
              style={{
                fontSize: '0.875rem',
                color: '#718096',
                marginBottom: '0.25rem',
              }}
            >
              Total Tasks
            </div>
            <div
              style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#2d3748',
              }}
            >
              {taskList.length}
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <div
              style={{
                fontSize: '0.875rem',
                color: '#718096',
                marginBottom: '0.25rem',
              }}
            >
              Completed
            </div>
            <div
              style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#48bb78',
              }}
            >
              {taskList.filter((t) => t.status === 'done').length}
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
            <div
              style={{
                fontSize: '0.875rem',
                color: '#718096',
                marginBottom: '0.25rem',
              }}
            >
              Teams
            </div>
            <div
              style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#667eea',
              }}
            >
              {teamList.length}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button
            onClick={() => setShowCreateTask(true)}
            style={{
              padding: '0.875rem 1.75rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.95rem',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => (e.target.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => (e.target.style.transform = 'translateY(0)')}
          >
            ➕ Create Task
          </button>
          <button
            onClick={() => setShowCreateTeam(true)}
            style={{
              padding: '0.875rem 1.75rem',
              background: 'white',
              color: '#667eea',
              border: '2px solid #667eea',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.95rem',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#667eea'
              e.target.style.color = 'white'
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'white'
              e.target.style.color = '#667eea'
            }}
          >
            👥 Create Team
          </button>
        </div>

        {/* Filters */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
          }}
        >
          <span
            style={{ fontWeight: '600', color: '#2d3748', fontSize: '0.95rem' }}
          >
            🔍 Filter:
          </span>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            style={{
              padding: '0.625rem 1rem',
              borderRadius: '8px',
              border: '2px solid #e2e8f0',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              outline: 'none',
              backgroundColor: 'white',
            }}
          >
            <option value="">All Status</option>
            <option value="todo">📝 To Do</option>
            <option value="in_progress">⚡ In Progress</option>
            <option value="done">✅ Done</option>
          </select>

          <select
            value={filter.priority}
            onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
            style={{
              padding: '0.625rem 1rem',
              borderRadius: '8px',
              border: '2px solid #e2e8f0',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              outline: 'none',
              backgroundColor: 'white',
            }}
          >
            <option value="">All Priority</option>
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option>
          </select>
        </div>

        {/* Tasks List */}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {taskList.length === 0 ? (
            <div
              style={{
                backgroundColor: 'white',
                padding: '4rem 2rem',
                borderRadius: '12px',
                textAlign: 'center',
                border: '2px dashed #e2e8f0',
              }}
            >
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
              <p style={{ color: '#718096', fontSize: '1.1rem', margin: 0 }}>
                No tasks found. Create your first task to get started!
              </p>
            </div>
          ) : (
            taskList.map((task) => (
              <div
                key={task.id}
                style={{
                  backgroundColor: 'white',
                  padding: '1.75rem',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow =
                    '0 8px 16px rgba(0,0,0,0.12)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    gap: '1rem',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          fontSize: '1.25rem',
                          color: '#1a202c',
                          fontWeight: '600',
                        }}
                      >
                        {task.title}
                      </h3>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor:
                            task.status === 'done'
                              ? '#c6f6d5'
                              : task.status === 'in_progress'
                              ? '#feebc8'
                              : '#e2e8f0',
                          color:
                            task.status === 'done'
                              ? '#22543d'
                              : task.status === 'in_progress'
                              ? '#7c2d12'
                              : '#2d3748',
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {task.status === 'done'
                          ? '✓ Done'
                          : task.status === 'in_progress'
                          ? '⚡ In Progress'
                          : '📝 To Do'}
                      </span>
                    </div>

                    {task.description && (
                      <p
                        style={{
                          margin: '0 0 1rem 0',
                          color: '#4a5568',
                          lineHeight: '1.6',
                        }}
                      >
                        {task.description}
                      </p>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        fontSize: '0.875rem',
                      }}
                    >
                      <div
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor:
                            task.priority === 'high'
                              ? '#fed7d7'
                              : task.priority === 'medium'
                              ? '#feebc8'
                              : '#bee3f8',
                          color:
                            task.priority === 'high'
                              ? '#742a2a'
                              : task.priority === 'medium'
                              ? '#7c2d12'
                              : '#2c5282',
                          borderRadius: '8px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        {task.priority === 'high'
                          ? '🔴'
                          : task.priority === 'medium'
                          ? '🟡'
                          : '🟢'}
                        {task.priority.charAt(0).toUpperCase() +
                          task.priority.slice(1)}{' '}
                        Priority
                      </div>

                      <div
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#f7fafc',
                          color: '#2d3748',
                          borderRadius: '8px',
                          fontWeight: '500',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        👥 {task.team_name}
                      </div>

                      {task.assigned_to_name && (
                        <div
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#edf2f7',
                            color: '#2d3748',
                            borderRadius: '8px',
                            fontWeight: '500',
                          }}
                        >
                          👤 {task.assigned_to_name}
                        </div>
                      )}

                      {task.created_by_name && (
                        <div
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#f7fafc',
                            color: '#718096',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                          }}
                        >
                          Created by {task.created_by_name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      minWidth: '140px',
                    }}
                  >
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleUpdateTask(task.id, { status: e.target.value })
                      }
                      style={{
                        padding: '0.5rem',
                        fontSize: '0.875rem',
                        borderRadius: '6px',
                        border: '2px solid #e2e8f0',
                        fontWeight: '500',
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      <option value="todo">📝 To Do</option>
                      <option value="in_progress">⚡ In Progress</option>
                      <option value="done">✅ Done</option>
                    </select>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      style={{
                        padding: '0.5rem',
                        backgroundColor: '#fff5f5',
                        color: '#c53030',
                        border: '2px solid #feb2b2',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#c53030'
                        e.target.style.color = 'white'
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#fff5f5'
                        e.target.style.color = '#c53030'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setShowCreateTask(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '2.5rem',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '550px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: '1.5rem',
                fontSize: '1.5rem',
                color: '#1a202c',
              }}
            >
              ✨ Create New Task
            </h2>
            <form onSubmit={handleCreateTask}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    color: '#2d3748',
                    fontSize: '0.9rem',
                  }}
                >
                  Task Title *
                </label>
                <input
                  name="title"
                  required
                  placeholder="e.g., Complete project documentation"
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#667eea')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    color: '#2d3748',
                    fontSize: '0.9rem',
                  }}
                >
                  Description
                </label>
                <textarea
                  name="description"
                  rows="4"
                  placeholder="Add task details..."
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#667eea')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    color: '#2d3748',
                    fontSize: '0.9rem',
                  }}
                >
                  Team *
                </label>
                <select
                  name="teamId"
                  required
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="">Select a team</option>
                  {teamList.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: '600',
                      color: '#2d3748',
                      fontSize: '0.9rem',
                    }}
                  >
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue="todo"
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      borderRadius: '8px',
                      border: '2px solid #e2e8f0',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value="todo">📝 To Do</option>
                    <option value="in_progress">⚡ In Progress</option>
                    <option value="done">✅ Done</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontWeight: '600',
                      color: '#2d3748',
                      fontSize: '0.9rem',
                    }}
                  >
                    Priority
                  </label>
                  <select
                    name="priority"
                    defaultValue="medium"
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      borderRadius: '8px',
                      border: '2px solid #e2e8f0',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'flex-end',
                  marginTop: '2rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowCreateTask(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: 'white',
                    color: '#4a5568',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = '#f7fafc')
                  }
                  onMouseOut={(e) => (e.target.style.backgroundColor = 'white')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background:
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                    transition: 'transform 0.2s',
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.transform = 'translateY(-2px)')
                  }
                  onMouseOut={(e) =>
                    (e.target.style.transform = 'translateY(0)')
                  }
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateTeam && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setShowCreateTeam(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '2.5rem',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '550px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: '1.5rem',
                fontSize: '1.5rem',
                color: '#1a202c',
              }}
            >
              👥 Create New Team
            </h2>
            <form onSubmit={handleCreateTeam}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    color: '#2d3748',
                    fontSize: '0.9rem',
                  }}
                >
                  Team Name *
                </label>
                <input
                  name="name"
                  required
                  placeholder="e.g., Development Team"
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#667eea')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    color: '#2d3748',
                    fontSize: '0.9rem',
                  }}
                >
                  Description
                </label>
                <textarea
                  name="description"
                  rows="4"
                  placeholder="Describe the team's purpose..."
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#667eea')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'flex-end',
                  marginTop: '2rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowCreateTeam(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: 'white',
                    color: '#4a5568',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = '#f7fafc')
                  }
                  onMouseOut={(e) => (e.target.style.backgroundColor = 'white')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background:
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                    transition: 'transform 0.2s',
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.transform = 'translateY(-2px)')
                  }
                  onMouseOut={(e) =>
                    (e.target.style.transform = 'translateY(0)')
                  }
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

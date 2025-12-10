// backend/src/controllers/taskController.js
const { query } = require('../config/database')

// Get all tasks for user's teams
const getAllTasks = async (req, res) => {
  try {
    const userId = req.user.userId
    const { status, priority, teamId } = req.query

    let queryText = `
      SELECT 
        t.id, t.title, t.description, t.status, t.priority,
        t.due_date, t.created_at, t.updated_at,
        t.team_id, teams.name as team_name,
        creator.first_name || ' ' || creator.last_name as created_by_name,
        assignee.first_name || ' ' || assignee.last_name as assigned_to_name,
        t.assigned_to
      FROM tasks t
      JOIN teams ON t.team_id = teams.id
      JOIN team_members tm ON teams.id = tm.team_id
      LEFT JOIN users creator ON t.created_by = creator.id
      LEFT JOIN users assignee ON t.assigned_to = assignee.id
      WHERE tm.user_id = $1
    `

    const params = [userId]
    let paramCount = 1

    // Add filters
    if (status) {
      paramCount++
      queryText += ` AND t.status = $${paramCount}`
      params.push(status)
    }

    if (priority) {
      paramCount++
      queryText += ` AND t.priority = $${paramCount}`
      params.push(priority)
    }

    if (teamId) {
      paramCount++
      queryText += ` AND t.team_id = $${paramCount}`
      params.push(teamId)
    }

    queryText += ' ORDER BY t.created_at DESC'

    const result = await query(queryText, params)

    res.json({
      tasks: result.rows,
      count: result.rows.length,
    })
  } catch (error) {
    console.error('Get all tasks error:', error)
    res.status(500).json({ error: 'Failed to fetch tasks' })
  }
}

// Get single task by ID
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const result = await query(
      `SELECT 
        t.id, t.title, t.description, t.status, t.priority,
        t.due_date, t.created_at, t.updated_at,
        t.team_id, teams.name as team_name,
        creator.first_name || ' ' || creator.last_name as created_by_name,
        assignee.first_name || ' ' || assignee.last_name as assigned_to_name,
        t.assigned_to
      FROM tasks t
      JOIN teams ON t.team_id = teams.id
      JOIN team_members tm ON teams.id = tm.team_id
      LEFT JOIN users creator ON t.created_by = creator.id
      LEFT JOIN users assignee ON t.assigned_to = assignee.id
      WHERE t.id = $1 AND tm.user_id = $2`,
      [id, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    res.json({ task: result.rows[0] })
  } catch (error) {
    console.error('Get task by ID error:', error)
    res.status(500).json({ error: 'Failed to fetch task' })
  }
}

// Create new task
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      teamId,
      assignedTo,
      dueDate,
    } = req.body
    const userId = req.user.userId

    // Validation
    if (!title || !teamId) {
      return res.status(400).json({ error: 'Title and team ID are required' })
    }

    // Check if user is member of the team
    const memberCheck = await query(
      'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, userId]
    )

    if (memberCheck.rows.length === 0) {
      return res
        .status(403)
        .json({ error: 'You are not a member of this team' })
    }

    // Create task
    const result = await query(
      `INSERT INTO tasks (
        title, description, status, priority, team_id, 
        created_by, assigned_to, due_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, title, description, status, priority, 
                team_id, created_by, assigned_to, due_date, 
                created_at, updated_at`,
      [
        title,
        description || null,
        status || 'todo',
        priority || 'medium',
        teamId,
        userId,
        assignedTo || null,
        dueDate || null,
      ]
    )

    res.status(201).json({
      message: 'Task created successfully',
      task: result.rows[0],
    })
  } catch (error) {
    console.error('Create task error:', error)
    res.status(500).json({ error: 'Failed to create task' })
  }
}

// Update task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, status, priority, assignedTo, dueDate } =
      req.body
    const userId = req.user.userId

    // Check if user has access to this task
    const accessCheck = await query(
      `SELECT t.id FROM tasks t
       JOIN team_members tm ON t.team_id = tm.team_id
       WHERE t.id = $1 AND tm.user_id = $2`,
      [id, userId]
    )

    if (accessCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    // Build update query dynamically
    const updates = []
    const params = []
    let paramCount = 1

    if (title !== undefined) {
      updates.push(`title = $${paramCount}`)
      params.push(title)
      paramCount++
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount}`)
      params.push(description)
      paramCount++
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount}`)
      params.push(status)
      paramCount++
    }
    if (priority !== undefined) {
      updates.push(`priority = $${paramCount}`)
      params.push(priority)
      paramCount++
    }
    if (assignedTo !== undefined) {
      updates.push(`assigned_to = $${paramCount}`)
      params.push(assignedTo)
      paramCount++
    }
    if (dueDate !== undefined) {
      updates.push(`due_date = $${paramCount}`)
      params.push(dueDate)
      paramCount++
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' })
    }

    params.push(id)
    const result = await query(
      `UPDATE tasks SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, title, description, status, priority, 
                 team_id, created_by, assigned_to, due_date, 
                 created_at, updated_at`,
      params
    )

    res.json({
      message: 'Task updated successfully',
      task: result.rows[0],
    })
  } catch (error) {
    console.error('Update task error:', error)
    res.status(500).json({ error: 'Failed to update task' })
  }
}

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    // Check if user has access and is creator or team admin
    const accessCheck = await query(
      `SELECT t.id, t.created_by, tm.role 
       FROM tasks t
       JOIN team_members tm ON t.team_id = tm.team_id
       WHERE t.id = $1 AND tm.user_id = $2`,
      [id, userId]
    )

    if (accessCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    const task = accessCheck.rows[0]

    // Only creator or team admin can delete
    if (task.created_by !== userId && task.role !== 'admin') {
      return res
        .status(403)
        .json({ error: 'You do not have permission to delete this task' })
    }

    await query('DELETE FROM tasks WHERE id = $1', [id])

    res.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Delete task error:', error)
    res.status(500).json({ error: 'Failed to delete task' })
  }
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
}

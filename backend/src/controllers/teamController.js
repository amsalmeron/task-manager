// backend/src/controllers/teamController.js
const { query } = require('../config/database')

// Get all teams for current user
const getUserTeams = async (req, res) => {
  try {
    const userId = req.user.userId

    const result = await query(
      `SELECT 
        t.id, t.name, t.description, t.created_at,
        tm.role,
        creator.first_name || ' ' || creator.last_name as created_by_name,
        COUNT(DISTINCT tm2.user_id) as member_count
      FROM teams t
      JOIN team_members tm ON t.id = tm.team_id
      LEFT JOIN users creator ON t.created_by = creator.id
      LEFT JOIN team_members tm2 ON t.id = tm2.team_id
      WHERE tm.user_id = $1
      GROUP BY t.id, t.name, t.description, t.created_at, tm.role, created_by_name
      ORDER BY t.created_at DESC`,
      [userId]
    )

    res.json({
      teams: result.rows,
      count: result.rows.length,
    })
  } catch (error) {
    console.error('Get user teams error:', error)
    res.status(500).json({ error: 'Failed to fetch teams' })
  }
}

// Get single team by ID
const getTeamById = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    // Check if user is member
    const memberCheck = await query(
      'SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2',
      [id, userId]
    )

    if (memberCheck.rows.length === 0) {
      return res
        .status(403)
        .json({ error: 'You are not a member of this team' })
    }

    const result = await query(
      `SELECT 
        t.id, t.name, t.description, t.created_at,
        creator.first_name || ' ' || creator.last_name as created_by_name
      FROM teams t
      LEFT JOIN users creator ON t.created_by = creator.id
      WHERE t.id = $1`,
      [id]
    )

    res.json({
      team: result.rows[0],
      userRole: memberCheck.rows[0].role,
    })
  } catch (error) {
    console.error('Get team by ID error:', error)
    res.status(500).json({ error: 'Failed to fetch team' })
  }
}

// Create new team
const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body
    const userId = req.user.userId

    // Validation
    if (!name) {
      return res.status(400).json({ error: 'Team name is required' })
    }

    // Create team
    const teamResult = await query(
      `INSERT INTO teams (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING id, name, description, created_at`,
      [name, description || null, userId]
    )

    const team = teamResult.rows[0]

    // Add creator as admin member
    await query(
      `INSERT INTO team_members (team_id, user_id, role)
       VALUES ($1, $2, $3)`,
      [team.id, userId, 'admin']
    )

    res.status(201).json({
      message: 'Team created successfully',
      team,
    })
  } catch (error) {
    console.error('Create team error:', error)
    res.status(500).json({ error: 'Failed to create team' })
  }
}

// Get team members
const getTeamMembers = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    // Check if user is member
    const memberCheck = await query(
      'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
      [id, userId]
    )

    if (memberCheck.rows.length === 0) {
      return res
        .status(403)
        .json({ error: 'You are not a member of this team' })
    }

    const result = await query(
      `SELECT 
        tm.id, tm.role, tm.joined_at,
        u.id as user_id, u.email,
        u.first_name || ' ' || u.last_name as name
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.team_id = $1
      ORDER BY tm.joined_at ASC`,
      [id]
    )

    res.json({
      members: result.rows,
      count: result.rows.length,
    })
  } catch (error) {
    console.error('Get team members error:', error)
    res.status(500).json({ error: 'Failed to fetch team members' })
  }
}

// Add member to team
const addTeamMember = async (req, res) => {
  try {
    const { id } = req.params
    const { email, role } = req.body
    const userId = req.user.userId

    // Validation
    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    // Check if current user is admin
    const adminCheck = await query(
      'SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2',
      [id, userId]
    )

    if (adminCheck.rows.length === 0) {
      return res
        .status(403)
        .json({ error: 'You are not a member of this team' })
    }

    if (adminCheck.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Only team admins can add members' })
    }

    // Find user by email
    const userResult = await query(
      'SELECT id, email, first_name, last_name FROM users WHERE email = $1',
      [email.toLowerCase()]
    )

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const newMember = userResult.rows[0]

    // Check if already a member
    const existingMember = await query(
      'SELECT id FROM team_members WHERE team_id = $1 AND user_id = $2',
      [id, newMember.id]
    )

    if (existingMember.rows.length > 0) {
      return res.status(400).json({ error: 'User is already a team member' })
    }

    // Add member
    await query(
      `INSERT INTO team_members (team_id, user_id, role)
       VALUES ($1, $2, $3)`,
      [id, newMember.id, role || 'member']
    )

    res.status(201).json({
      message: 'Member added successfully',
      member: {
        userId: newMember.id,
        email: newMember.email,
        name: `${newMember.first_name} ${newMember.last_name}`,
        role: role || 'member',
      },
    })
  } catch (error) {
    console.error('Add team member error:', error)
    res.status(500).json({ error: 'Failed to add team member' })
  }
}

// Remove member from team
const removeTeamMember = async (req, res) => {
  try {
    const { id, memberId } = req.params
    const userId = req.user.userId

    // Check if current user is admin
    const adminCheck = await query(
      'SELECT role FROM team_members WHERE team_id = $1 AND user_id = $2',
      [id, userId]
    )

    if (adminCheck.rows.length === 0) {
      return res
        .status(403)
        .json({ error: 'You are not a member of this team' })
    }

    if (adminCheck.rows[0].role !== 'admin' && userId.toString() !== memberId) {
      return res
        .status(403)
        .json({ error: 'Only admins can remove other members' })
    }

    // Cannot remove yourself if you're the last admin
    if (userId.toString() === memberId) {
      const adminCount = await query(
        'SELECT COUNT(*) FROM team_members WHERE team_id = $1 AND role = $2',
        [id, 'admin']
      )

      if (parseInt(adminCount.rows[0].count) === 1) {
        return res.status(400).json({ error: 'Cannot remove the last admin' })
      }
    }

    // Remove member
    const result = await query(
      'DELETE FROM team_members WHERE team_id = $1 AND user_id = $2',
      [id, memberId]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Member not found' })
    }

    res.json({ message: 'Member removed successfully' })
  } catch (error) {
    console.error('Remove team member error:', error)
    res.status(500).json({ error: 'Failed to remove team member' })
  }
}

module.exports = {
  getUserTeams,
  getTeamById,
  createTeam,
  getTeamMembers,
  addTeamMember,
  removeTeamMember,
}

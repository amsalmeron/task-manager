// backend/src/routes/teams.js
const express = require('express')
const router = express.Router()
const {
  getUserTeams,
  getTeamById,
  createTeam,
  getTeamMembers,
  addTeamMember,
  removeTeamMember,
} = require('../controllers/teamController')
const { authenticateToken } = require('../middleware/auth')

// All routes require authentication
router.use(authenticateToken)

// Get all teams for user
router.get('/', getUserTeams)

// Create new team
router.post('/', createTeam)

// Get single team
router.get('/:id', getTeamById)

// Get team members
router.get('/:id/members', getTeamMembers)

// Add member to team
router.post('/:id/members', addTeamMember)

// Remove member from team
router.delete('/:id/members/:memberId', removeTeamMember)

module.exports = router

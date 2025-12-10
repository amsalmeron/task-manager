// backend/src/routes/tasks.js
const express = require('express')
const router = express.Router()
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController')
const { authenticateToken } = require('../middleware/auth')

// All routes require authentication
router.use(authenticateToken)

// Get all tasks (with optional filters)
router.get('/', getAllTasks)

// Get single task
router.get('/:id', getTaskById)

// Create new task
router.post('/', createTask)

// Update task
router.put('/:id', updateTask)

// Delete task
router.delete('/:id', deleteTask)

module.exports = router

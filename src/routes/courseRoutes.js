const express = require('express');
const router = express.Router();
const { getCourses } = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Search and filter courses
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search keyword for course name
 *       - in: query
 *         name: tingkat
 *         schema:
 *           type: string
 *         description: Filter by Level (1, 2, 3, 4)
 *     responses:
 *       200:
 *         description: List of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nama_mk:
 *                     type: string
 *                   sks:
 *                     type: number
 *                   tingkat:
 *                     type: string
 *       401:
 *         description: Not authorized
 */
router.get('/', protect, getCourses);

module.exports = router;

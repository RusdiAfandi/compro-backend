const express = require('express');
const router = express.Router();
const { updateInterests, getRecommendations, getInterests } = require('../controllers/interestsController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/interests:
 *   get:
 *     summary: Get User Interests and Available Options
 *     tags: [Interests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User interests and master list
 */
router.get('/', protect, getInterests);

/**
 *   post:
 *     summary: Update User Interests (FR03.1)
 *     tags: [Interests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hard_skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               soft_skills:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Interests updated
 *       400:
 *         description: Invalid input
 */
router.post('/', protect, updateInterests);

/**
 * @swagger
 * /api/interests/recommend:
 *   post:
 *     summary: Get AI Recommendations (FR03.2)
 *     tags: [Interests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recommendations generated
 */
router.post('/recommend', protect, getRecommendations);

module.exports = router;

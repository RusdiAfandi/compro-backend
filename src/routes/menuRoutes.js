const express = require('express');
const router = express.Router();
const { getMainMenu } = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/menu:
 *   get:
 *     summary: Get Main Menu and Student Profile
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Menu and Profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile:
 *                       type: object
 *                     menus:
 *                       type: array
 *       401:
 *         description: Not authorized
 */
router.get('/', protect, getMainMenu);

module.exports = router;

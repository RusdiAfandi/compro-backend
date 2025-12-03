const express = require('express');
const router = express.Router();
const { calculateSimulation, endSession, getSimulationPlan } = require('../controllers/simulationController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/simulation/plan:
 *   get:
 *     summary: Get default study plan for simulation
 *     tags: [Simulation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: semester
 *         schema:
 *           type: integer
 *         required: true
 *         description: Target semester (e.g. 5)
 *       - in: query
 *         name: study_plan
 *         schema:
 *           type: string
 *           enum: [Reguler, Fast Track]
 *         description: Study Plan Type
 *     responses:
 *       200:
 *         description: List of default courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 */
router.get('/plan', protect, getSimulationPlan);

/**
 * @swagger
 * /api/simulation/calculate:
 *   post:
 *     summary: Calculate IPS, Cumulative IPK, and Trend
 *     tags: [Simulation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - target_semester
 *               - simulated_courses
 *             properties:
 *               target_semester:
 *                 type: integer
 *                 example: 5
 *               study_plan:
 *                 type: string
 *                 enum: [Reguler, Fast Track]
 *               simulated_courses:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nama_mk:
 *                       type: string
 *                     sks:
 *                       type: integer
 *                     nilai:
 *                       type: string
 *                       enum: [A, AB, B, BC, C, D, E]
 *     responses:
 *       200:
 *         description: Simulation results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid input (empty list or missing grades)
 *       422:
 *         description: Malformed data
 *       401:
 *         description: Not authorized
 */
router.post('/calculate', protect, calculateSimulation);

/**
 * @swagger
 * /api/simulation/end-session:
 *   post:
 *     summary: End simulation session
 *     tags: [Simulation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Session ended successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/end-session', protect, endSession);

module.exports = router;

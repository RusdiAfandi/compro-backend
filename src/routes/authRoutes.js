const express = require('express');
const router = express.Router();
const { loginStudent, registerStudent } = require('../controllers/authController');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new student
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nim
 *               - nama
 *               - email_sso
 *               - password
 *             properties:
 *               nim:
 *                 type: string
 *               nama:
 *                 type: string
 *               email_sso:
 *                 type: string
 *               password:
 *                 type: string
 *               jurusan:
 *                 type: string
 *               fakultas:
 *                 type: string
 *               angkatan:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         description: User already exists or invalid data
 */
router.post('/register', registerStudent);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login student
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nim
 *               - password
 *             properties:
 *               nim:
 *                 type: string
 *                 description: Student NIM
 *               password:
 *                 type: string
 *                 description: Student Password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     nim:
 *                       type: string
 *                     nama:
 *                       type: string
 *                     token:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginStudent);

module.exports = router;

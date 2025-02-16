// src/routes/subjectRoutes.js
const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const authMiddleware = require('../middleware/auth');

// 科目相关路由
router.get('/subjects', authMiddleware, subjectController.getSubjects, (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

router.post('/subjects', authMiddleware, subjectController.addSubject, (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

router.put('/subjects/:id', authMiddleware, subjectController.updateSubject, (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

router.patch('/subjects/:id/status', authMiddleware, subjectController.toggleSubjectStatus, (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

router.post('/subjects/import', authMiddleware, subjectController.importSubjects, (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

router.get('/subjects/export', authMiddleware, subjectController.exportSubjects, (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

module.exports = router;
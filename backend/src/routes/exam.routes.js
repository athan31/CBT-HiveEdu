const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/admin.middleware');
const {
  startExam, getQuestions, saveAnswer, finishExam, getResult, getActiveExams, getExamInfo, updateSkorSkb,
} = require('../controllers/participant.controller');

router.use(requireAuth);

router.get('/active', getActiveExams);
router.get('/info/:examId', getExamInfo);
router.post('/start', startExam);
router.get('/questions/:examId', getQuestions);
router.patch('/save-answer', saveAnswer);
router.post('/finish', finishExam);
router.get('/result/:sessionId', getResult);

// Admin: input skor SKB → recalculate integrasi otomatis
router.patch('/skb/:sessionId', requireAdmin, updateSkorSkb);

module.exports = router;

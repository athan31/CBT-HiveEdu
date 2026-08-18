const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireAdmin, requireAdminOnly } = require('../middlewares/admin.middleware');
const {
  getAllExams, getExamById, createExam, updateExam, deleteExam,
  getQuestions, createQuestion, updateQuestion, deleteQuestion,
  getLeaderboard, getViolationLogs, getAllUsers, createUser, updateUser, deleteUser,
  toggleExamActive, getExamSessions,
} = require('../controllers/admin.controller');
const { importQuestionsExcel } = require('../controllers/importExcel.controller');

const {
  getCentralQuestions,
  createCentralQuestion,
  updateCentralQuestion,
  deleteCentralQuestion,
  distributeToExam,
  importCentralExcel,
} = require('../controllers/bankSoal.controller');

// All admin routes require auth + admin/tutor role
router.use(requireAuth, requireAdmin);

// Bank Soal Central (ADMIN + TUTOR)
router.get('/bank-soal', getCentralQuestions);
router.post('/bank-soal', createCentralQuestion);
router.put('/bank-soal/:id', updateCentralQuestion);
router.delete('/bank-soal/:id', deleteCentralQuestion);
router.post('/bank-soal/distribute', distributeToExam);
router.post('/bank-soal/import', importCentralExcel);

// Exams (ADMIN + TUTOR)
router.get('/exams', getAllExams);
router.get('/exams/:id', getExamById);
router.post('/exams', createExam);
router.put('/exams/:id', updateExam);
router.delete('/exams/:id', deleteExam);
router.patch('/exams/:id/toggle', toggleExamActive);

// Questions (ADMIN + TUTOR)
router.post('/exams/:examId/questions/import', importQuestionsExcel);
router.get('/exams/:examId/questions', getQuestions);
router.post('/exams/:examId/questions', createQuestion);
router.put('/exams/:examId/questions/:questionId', updateQuestion);
router.delete('/exams/:examId/questions/:questionId', deleteQuestion);

// Reports & Monitoring (ADMIN + TUTOR)
router.get('/leaderboard/:examId', getLeaderboard);
router.get('/violations/:examId', getViolationLogs);
router.get('/sessions/:examId', getExamSessions);

// Users — read: ADMIN + TUTOR, write: ADMIN only
router.get('/users', getAllUsers);
router.post('/users', requireAdminOnly, createUser);
router.put('/users/:id', requireAdminOnly, updateUser);
router.delete('/users/:id', requireAdminOnly, deleteUser);

module.exports = router;

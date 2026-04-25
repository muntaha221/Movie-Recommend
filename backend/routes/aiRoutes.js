const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Removed 'auth' middleware so everyone can use the Mood Matcher immediately
router.post('/recommend', aiController.getRecommendations);

module.exports = router;

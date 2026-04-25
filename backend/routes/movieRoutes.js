const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const auth = require('../middleware/auth');

router.get('/trending', movieController.getTrending);
router.get('/collections', movieController.getCollections);
router.get('/details/:id', movieController.getMovieDetails);
router.post('/watchlist', auth, movieController.addToWatchlist);
router.delete('/watchlist/:movieId', auth, movieController.removeFromWatchlist);
router.post('/review', auth, movieController.addReview);
router.get('/:tmdbId/reviews', movieController.getMovieReviews);

module.exports = router;

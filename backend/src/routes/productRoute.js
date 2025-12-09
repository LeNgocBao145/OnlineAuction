import express from 'express';
import ProductController from '../controllers/productController.js';

const router = express.Router();

router.get('/', ProductController.filterProducts);
router.get('/filter', ProductController.filterProducts);
router.get('/:productId', ProductController.getProductDetails);
router.post('/:productId/ask/:userId', ProductController.askQuestion);
router.post('/:productId/ask-to-bid/:userId', ProductController.askToBid);
router.get('/:productId/bid-requests', ProductController.getProductBidRequests);
router.post('/:productId/bid/:userId', ProductController.placeBid);
router.post('/:productId/:questionId/answer/:answererId', ProductController.answerQuestion);
router.post('/:productId/bid-requests/:requestId/accept/:userId', ProductController.acceptBidRequest);
router.post('/:productId/bid-requests/:requestId/reject/:userId', ProductController.rejectBidRequest);

export default router;
import express from 'express';
import ProductController from '../controllers/productController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', ProductController.filterProducts);
router.get('/filter', ProductController.filterProducts);
router.get('/:productId', optionalAuthenticateToken, ProductController.getProductDetails);
router.post('/add', ProductController.addProduct);
router.post('/:productId/add/description', ProductController.addDescription);
router.post('/:productId/ask', authenticateToken, ProductController.askQuestion);
router.post('/:productId/ask-to-bid', authenticateToken, ProductController.askToBid);
router.get('/:productId/bid-requests', authenticateToken, ProductController.getProductBidRequests);
router.post('/:productId/bid', authenticateToken, ProductController.placeBid);
router.post('/:productId/:questionId/answer', authenticateToken, ProductController.answerQuestion);
router.post('/:productId/bid-requests/:requestId/accept', authenticateToken, ProductController.acceptBidRequest);
router.post('/:productId/bid-requests/:requestId/reject', authenticateToken, ProductController.rejectBidRequest);
router.put('/:productId', authenticateToken, ProductController.updateProduct);
router.post('/:productId/close', authenticateToken, ProductController.closeAuction);
router.delete('/:productId', authenticateToken, ProductController.deleteProduct);
router.get('/:productId/bidders', authenticateToken, ProductController.getProductBidders);
router.post('/:productId/bidders/:bidderId/refuse', authenticateToken, ProductController.refuseBidder);
router.post('/:productId/bidders/:bidderId/unrefuse', authenticateToken, ProductController.unrefuseBidder);


export default router;
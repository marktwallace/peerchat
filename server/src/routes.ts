import express from 'express';
import { authMiddleware } from './middlewares/authMiddleware';
import { createInvite, acceptInvite } from './controllers/inviteController';
import { login, confirmLogin } from './controllers/authController';
import { postReply } from './controllers/replyController';

const router = express.Router();

// Unprotected routes
router.post('/create-invite', createInvite);
router.post('/accept-invite', acceptInvite);
router.post('/login', login);
router.post('/confirm-login', confirmLogin);

// Protected routes
router.get('/protected', authMiddleware, (req,res) => {
    res.json({message: 'Protected resource'});
});
router.post('/reply', authMiddleware, postReply);

export default router;

import express from 'express';
import { getWorkOrders, createWorkOrder, getStats } from '../controllers/workOrderController.js';

const router = express.Router();

router.get('/', getWorkOrders);
router.post('/', createWorkOrder);
router.get('/stats', getStats);

export default router;

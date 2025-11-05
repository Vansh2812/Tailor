import express from 'express';
import {
  getRepairWorks,
  addRepairWork,
  updateRepairWork,
  deleteRepairWork
} from '../controllers/repairWorkController.js';

const router = express.Router();

router.get('/', getRepairWorks);
router.post('/', addRepairWork);
router.put('/:id', updateRepairWork);
router.delete('/:id', deleteRepairWork);

export default router;

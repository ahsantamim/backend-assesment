import express from "express";
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
} from "../controllers/leadController";
import {
  createLeadValidator,
  getLeadByIdValidator,
  deleteLeadValidator,
  updateLeadValidator,
} from "../validators/lead";
import { authenticate } from "../middleware/authentication";

const router = express.Router();

router.post("/leads", authenticate, createLeadValidator(), createLead);
router.get("/leads", authenticate, getLeads);
router.get("/leads/:id", authenticate, getLeadByIdValidator(), getLeadById);
router.put("/leads/:id", authenticate, updateLeadValidator(), updateLead);
router.delete("/leads/:id", authenticate, deleteLeadValidator(), deleteLead);

export default router;

import { Request, Response } from "express";
import Lead from "../models/Lead";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../constants/messages";

export const createLead = async (req: Request, res: Response) => {
  const { name, email, phone } = req.body;

  try {
    const user = req.user!;
    const newLead = new Lead({ name, email, phone, assignedTo: user.id });
    await newLead.save();
    res.status(201).json({
      message: SUCCESS_MESSAGES.LEAD_CREATED,
      lead: newLead,
    });
  } catch (error) {
    res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

export const getLeads = async (req: Request, res: Response) => {
  try {
    const leads = await Lead.find();
    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

export const getLeadById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const lead = await Lead.findById(id);
    if (!lead) {
      res.status(404).json({ error: ERROR_MESSAGES.LEAD_NOT_FOUND });
      return;
    }
    res.status(200).json(lead);
  } catch (error) {
    res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

export const updateLead = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, phone, status, assignedTo } = req.body;

  try {
    const lead = await Lead.findByIdAndUpdate(
      id,
      { name, email, phone, status, assignedTo },
      { new: true }
    );

    if (!lead) {
      res.status(404).json({ error: ERROR_MESSAGES.LEAD_NOT_FOUND });
      return;
    }

    res.status(200).json({ message: SUCCESS_MESSAGES.LEAD_UPDATED, lead });
  } catch (error) {
    res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

export const deleteLead = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const lead = await Lead.findByIdAndDelete(id);
    if (!lead) {
      res.status(404).json({ error: ERROR_MESSAGES.LEAD_NOT_FOUND });
      return;
    }
    res.status(200).json({ message: SUCCESS_MESSAGES.LEAD_DELETED });
  } catch (error) {
    res.status(500).json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
};

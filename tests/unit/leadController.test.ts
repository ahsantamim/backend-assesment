import { Request, Response } from "express";
import Lead from "../../src/models/Lead";
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
} from "../../src/controllers/leadController";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../src/constants/messages";

jest.mock("../../src/models/Lead");

const getMockReqAndRes = () => {
  const mockReq = {
    body: { name: "Test Lead", email: "test@lead.com", phone: "1234567890" },
    params: { id: "1" },
    user: { id: "user1" },
  } as unknown as Request;

  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;

  return { mockReq, mockRes };
};

describe("Lead Controller", () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockReq = getMockReqAndRes().mockReq;
    mockRes = getMockReqAndRes().mockRes;
  });

  describe("createLead", () => {
    it("should create a new lead and return 201", async () => {
      (Lead.prototype.save as jest.Mock).mockResolvedValue({
        _id: "1",
        name: "Test Lead",
        email: "test@lead.com",
        phone: "1234567890",
        assignedTo: "user1",
      });

      await createLead(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: SUCCESS_MESSAGES.LEAD_CREATED,
        })
      );
    });

    it("should return 500 for unexpected errors", async () => {
      (Lead.prototype.save as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await createLead(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe("getLeads", () => {
    it("should fetch all leads and return 200", async () => {
      (Lead.find as jest.Mock).mockResolvedValue([
        { _id: "1", name: "Lead 1" },
        { _id: "2", name: "Lead 2" },
      ]);

      await getLeads(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: "Lead 1" }),
          expect.objectContaining({ name: "Lead 2" }),
        ])
      );
    });

    it("should return 500 for unexpected errors", async () => {
      (Lead.find as jest.Mock).mockRejectedValue(new Error("Database error"));

      await getLeads(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe("getLeadById", () => {
    it("should fetch a lead by ID and return 200", async () => {
      (Lead.findById as jest.Mock).mockResolvedValue({
        _id: "1",
        name: "Lead 1",
      });

      await getLeadById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Lead 1" })
      );
    });

    it("should return 404 if lead is not found", async () => {
      (Lead.findById as jest.Mock).mockResolvedValue(null);

      await getLeadById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.LEAD_NOT_FOUND,
      });
    });

    it("should return 500 for unexpected errors", async () => {
      (Lead.findById as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await getLeadById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe("updateLead", () => {
    it("should update a lead and return 200", async () => {
      (Lead.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        _id: "1",
        name: "Updated Lead",
      });

      await updateLead(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: SUCCESS_MESSAGES.LEAD_UPDATED,
        })
      );
    });

    it("should return 404 if lead is not found", async () => {
      (Lead.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await updateLead(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.LEAD_NOT_FOUND,
      });
    });

    it("should return 500 for unexpected errors", async () => {
      (Lead.findByIdAndUpdate as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await updateLead(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe("deleteLead", () => {
    it("should delete a lead and return 200", async () => {
      (Lead.findByIdAndDelete as jest.Mock).mockResolvedValue({
        _id: "1",
        name: "Deleted Lead",
      });

      await deleteLead(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: SUCCESS_MESSAGES.LEAD_DELETED,
        })
      );
    });

    it("should return 404 if lead is not found", async () => {
      (Lead.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      await deleteLead(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.LEAD_NOT_FOUND,
      });
    });

    it("should return 500 for unexpected errors", async () => {
      (Lead.findByIdAndDelete as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await deleteLead(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      });
    });
  });
});

import { Document, Schema, Types, model } from "mongoose";

interface ILead extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  status: string; // e.g. 'open', 'contacted', 'closed'
  assignedTo: string; // User ID of the team member
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    status: { type: String, default: "open" },
    assignedTo: { type: String, required: true }, // User ID
  },
  { timestamps: true }
);

export default model<ILead>("Lead", leadSchema);

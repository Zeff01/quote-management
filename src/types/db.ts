import { ObjectId } from "mongodb";

export interface QuoteDocument {
  _id: ObjectId;
  salesPersonEmail: string;
  recipientEmail: string;
  amount: number;
  status: QuoteStatus;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type QuoteStatus = "pending" | "accepted" | "denied";

export interface QuoteUpdateRequest {
  status: Exclude<QuoteStatus, "pending">;
}

export interface QuoteResponse {
  message: string;
  quote?: QuoteDocument;
}

export interface QuoteStats {
  total: number;
  accepted: number;
  denied: number;
  pending: number;
}

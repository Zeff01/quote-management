interface Quote {
  id: string;
  salesPersonEmail: string;
  recipientEmail: string;
  amount: number;
  status: "pending" | "accepted" | "denied";
  createdAt: Date;
  updatedAt: Date;
}

import { Request, Response } from "express";

export const transactionController = {
  async getAllTransactions(req: Request, res: Response) {
    try {
      console.log("Fetching all transactions");
      
      // Mock transactions data
      const transactions = [
        {
          id: "1",
          resourceId: "1",
          resourceName: "MacBook Pro",
          userId: "1",
          userName: "John Doe",
          type: "checkout",
          quantity: 1,
          status: "active",
          checkoutDate: new Date().toISOString(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      res.json({
        success: true,
        data: transactions
      });
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  },

  async createTransaction(req: Request, res: Response) {
    try {
      console.log("Creating transaction:", req.body);
      
      const transactionData = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date().toISOString()
      };
      
      res.status(201).json({
        success: true,
        data: transactionData
      });
    } catch (error) {
      console.error("Create transaction error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }
};
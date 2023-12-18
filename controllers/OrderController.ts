import { Request, Response } from "express";

export default class OrderController {
  static async createOrder(req: Request, res: Response) {
    const requestData = {
      ...req.body,
      startDate: Date.now(),
      endDate: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    res.status(200).json({
      success: true,
      data: requestData
    });
  }
}
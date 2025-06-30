import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

// Middleware to validate request against Zod schema
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body, query, and params against schema
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      next();
    } catch (error: any) {
      // Extract and format validation errors
      const errors = error.errors.map((err: any) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }
  };
};

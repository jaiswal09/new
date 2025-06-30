import { Request, Response } from 'express';
import getDbConnection from '../config/db';

const db = getDbConnection();

// Get all transactions
export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const { resource_id, user_id, type, status, limit = 20, page = 1 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = `
      SELECT t.*, 
             r.name as resource_name, 
             u.name as user_name 
      FROM transactions t
      JOIN resources r ON t.resource_id = r.id
      JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const queryParams: any[] = [];
    let paramCount = 1;
    
    // Add filters
    if (resource_id) {
      query += ` AND t.resource_id = $${paramCount++}`;
      queryParams.push(resource_id);
    }
    
    if (user_id) {
      query += ` AND t.user_id = $${paramCount++}`;
      queryParams.push(user_id);
    }
    
    if (type) {
      query += ` AND t.transaction_type = $${paramCount++}`;
      queryParams.push(type);
    }
    
    if (status) {
      query += ` AND t.status = $${paramCount++}`;
      queryParams.push(status);
    }
    
    // Add sorting and pagination
    query += ` ORDER BY t.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    queryParams.push(limit, offset);
    
    // Execute query
    const result = await db.query(query, queryParams);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM transactions t
      WHERE 1=1
    `;
    
    paramCount = 1;
    const countParams: any[] = [];
    
    // Add filters to count query
    if (resource_id) {
      countQuery += ` AND t.resource_id = $${paramCount++}`;
      countParams.push(resource_id);
    }
    
    if (user_id) {
      countQuery += ` AND t.user_id = $${paramCount++}`;
      countParams.push(user_id);
    }
    
    if (type) {
      countQuery += ` AND t.transaction_type = $${paramCount++}`;
      countParams.push(type);
    }
    
    if (status) {
      countQuery += ` AND t.status = $${paramCount++}`;
      countParams.push(status);
    }
    
    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    
    res.status(200).json({
      success: true,
      count: result.rows.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: result.rows,
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving transactions',
      error: (error as Error).message,
    });
  }
};

// Get single transaction
export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT t.*, 
             r.name as resource_name, 
             u.name as user_name 
      FROM transactions t
      JOIN resources r ON t.resource_id = r.id
      JOIN users u ON t.user_id = u.id
      WHERE t.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error getting transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving transaction',
      error: (error as Error).message,
    });
  }
};

// Create a new transaction (check-in/check-out)
export const createTransaction = async (req: Request, res: Response) => {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      resource_id,
      transaction_type,
      quantity,
      scheduled_return_date,
      notes,
    } = req.body;

    // Validate resource exists and has enough quantity for check-out
    const resourceResult = await client.query('SELECT * FROM resources WHERE id = $1', [resource_id]);

    if (resourceResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    const resource = resourceResult.rows[0];

    // Handle different transaction types
    if (transaction_type === 'check_out') {
      // Check if resource has enough quantity
      if (resource.quantity < quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Not enough quantity available for check-out',
        });
      }

      // Required scheduled return date for check-out
      if (!scheduled_return_date) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Scheduled return date is required for check-out',
        });
      }

      // Create transaction record
      const transactionResult = await client.query(
        `INSERT INTO transactions 
         (resource_id, user_id, transaction_type, quantity, scheduled_return_date, status, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [
          resource_id,
          req.user.userId,
          transaction_type,
          quantity,
          scheduled_return_date,
          'approved', // Auto-approve for now, could be pending for approval workflow
          notes,
        ]
      );

      // Update resource quantity
      const newQuantity = resource.quantity - quantity;
      const newStatus = newQuantity === 0 ? 'out_of_stock' : (newQuantity <= resource.min_quantity ? 'low_stock' : 'available');
      
      await client.query(
        'UPDATE resources SET quantity = $1, status = $2, updated_at = NOW() WHERE id = $3',
        [newQuantity, newStatus, resource_id]
      );

      // Create audit log
      await client.query(
        'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
        [
          req.user.userId,
          'resource_check_out',
          'transactions',
          transactionResult.rows[0].id,
          JSON.stringify({
            resource_id,
            resource_name: resource.name,
            quantity,
            scheduled_return_date,
          }),
        ]
      );

      await client.query('COMMIT');
      
      res.status(201).json({
        success: true,
        message: 'Resource checked out successfully',
        data: transactionResult.rows[0],
      });
    } else if (transaction_type === 'check_in') {
      // Create transaction record
      const transactionResult = await client.query(
        `INSERT INTO transactions 
         (resource_id, user_id, transaction_type, quantity, actual_return_date, status, notes) 
         VALUES ($1, $2, $3, $4, NOW(), $5, $6) 
         RETURNING *`,
        [
          resource_id,
          req.user.userId,
          transaction_type,
          quantity,
          'completed',
          notes,
        ]
      );

      // Update resource quantity
      const newQuantity = resource.quantity + quantity;
      const newStatus = newQuantity <= resource.min_quantity ? 'low_stock' : 'available';
      
      await client.query(
        'UPDATE resources SET quantity = $1, status = $2, updated_at = NOW() WHERE id = $3',
        [newQuantity, newStatus, resource_id]
      );

      // Create audit log
      await client.query(
        'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
        [
          req.user.userId,
          'resource_check_in',
          'transactions',
          transactionResult.rows[0].id,
          JSON.stringify({
            resource_id,
            resource_name: resource.name,
            quantity,
          }),
        ]
      );

      await client.query('COMMIT');
      
      res.status(201).json({
        success: true,
        message: 'Resource checked in successfully',
        data: transactionResult.rows[0],
      });
    } else if (transaction_type === 'addition' || transaction_type === 'removal') {
      // For inventory adjustments (additions/removals)
      
      // For removals, check if there's enough quantity
      if (transaction_type === 'removal' && resource.quantity < quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Not enough quantity available for removal',
        });
      }

      // Create transaction record
      const transactionResult = await client.query(
        `INSERT INTO transactions 
         (resource_id, user_id, transaction_type, quantity, status, notes) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [
          resource_id,
          req.user.userId,
          transaction_type,
          quantity,
          'completed',
          notes,
        ]
      );

      // Update resource quantity
      const newQuantity = transaction_type === 'addition' 
        ? resource.quantity + quantity 
        : resource.quantity - quantity;
        
      const newStatus = newQuantity === 0 
        ? 'out_of_stock' 
        : (newQuantity <= resource.min_quantity ? 'low_stock' : 'available');
      
      await client.query(
        'UPDATE resources SET quantity = $1, status = $2, updated_at = NOW() WHERE id = $3',
        [newQuantity, newStatus, resource_id]
      );

      // Create audit log
      await client.query(
        'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
        [
          req.user.userId,
          `resource_${transaction_type}`,
          'transactions',
          transactionResult.rows[0].id,
          JSON.stringify({
            resource_id,
            resource_name: resource.name,
            quantity,
            reason: notes,
          }),
        ]
      );

      await client.query('COMMIT');
      
      res.status(201).json({
        success: true,
        message: `Resource ${transaction_type} successful`,
        data: transactionResult.rows[0],
      });
    } else {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction type',
      });
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating transaction',
      error: (error as Error).message,
    });
  } finally {
    client.release();
  }
};

// Update a transaction status
export const updateTransactionStatus = async (req: Request, res: Response) => {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    
    const { status, notes } = req.body;

    // Get the current transaction
    const transactionResult = await client.query('SELECT * FROM transactions WHERE id = $1', [req.params.id]);

    if (transactionResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    const transaction = transactionResult.rows[0];

    // Don't allow updating completed transactions
    if (transaction.status === 'completed') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Cannot update a completed transaction',
      });
    }

    // Handle different status updates
    if (status === 'approved' && transaction.status === 'pending') {
      // For approving check-outs, we need to update the resource quantity
      if (transaction.transaction_type === 'check_out') {
        // Get the resource
        const resourceResult = await client.query('SELECT * FROM resources WHERE id = $1', [transaction.resource_id]);
        
        if (resourceResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({
            success: false,
            message: 'Resource not found',
          });
        }
        
        const resource = resourceResult.rows[0];
        
        // Check if resource has enough quantity
        if (resource.quantity < transaction.quantity) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            message: 'Not enough quantity available for check-out',
          });
        }
        
        // Update resource quantity
        const newQuantity = resource.quantity - transaction.quantity;
        const newStatus = newQuantity === 0 ? 'out_of_stock' : (newQuantity <= resource.min_quantity ? 'low_stock' : 'available');
        
        await client.query(
          'UPDATE resources SET quantity = $1, status = $2, updated_at = NOW() WHERE id = $3',
          [newQuantity, newStatus, transaction.resource_id]
        );
      }
    } else if (status === 'completed' && transaction.transaction_type === 'check_in') {
      // Get the resource
      const resourceResult = await client.query('SELECT * FROM resources WHERE id = $1', [transaction.resource_id]);
      
      if (resourceResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Resource not found',
        });
      }
      
      const resource = resourceResult.rows[0];
      
      // Update resource quantity
      const newQuantity = resource.quantity + transaction.quantity;
      const newStatus = newQuantity <= resource.min_quantity ? 'low_stock' : 'available';
      
      await client.query(
        'UPDATE resources SET quantity = $1, status = $2, updated_at = NOW() WHERE id = $3',
        [newQuantity, newStatus, transaction.resource_id]
      );
      
      // Update the transaction with actual return date
      await client.query(
        'UPDATE transactions SET actual_return_date = NOW() WHERE id = $1',
        [req.params.id]
      );
    } else if (status === 'rejected' && transaction.transaction_type === 'check_out' && transaction.status === 'approved') {
      // If rejecting a previously approved check-out, restore the resource quantity
      const resourceResult = await client.query('SELECT * FROM resources WHERE id = $1', [transaction.resource_id]);
      
      if (resourceResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Resource not found',
        });
      }
      
      const resource = resourceResult.rows[0];
      
      // Update resource quantity
      const newQuantity = resource.quantity + transaction.quantity;
      const newStatus = newQuantity <= resource.min_quantity ? 'low_stock' : 'available';
      
      await client.query(
        'UPDATE resources SET quantity = $1, status = $2, updated_at = NOW() WHERE id = $3',
        [newQuantity, newStatus, transaction.resource_id]
      );
    }

    // Update transaction status
    const updateResult = await client.query(
      'UPDATE transactions SET status = $1, notes = CASE WHEN $2::text IS NULL THEN notes ELSE $2 END, updated_at = NOW() WHERE id = $3 RETURNING *',
      [status, notes, req.params.id]
    );

    // Create audit log
    await client.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [
        req.user.userId,
        'transaction_status_update',
        'transactions',
        req.params.id,
        JSON.stringify({
          transaction_id: req.params.id,
          previous_status: transaction.status,
          new_status: status,
          notes,
        }),
      ]
    );

    await client.query('COMMIT');
    
    res.status(200).json({
      success: true,
      message: 'Transaction status updated successfully',
      data: updateResult.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating transaction status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating transaction status',
      error: (error as Error).message,
    });
  } finally {
    client.release();
  }
};

// Get overdue transactions
export const getOverdueTransactions = async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT t.*, 
             r.name as resource_name, 
             u.name as user_name 
      FROM transactions t
      JOIN resources r ON t.resource_id = r.id
      JOIN users u ON t.user_id = u.id
      WHERE t.transaction_type = 'check_out'
        AND t.status = 'approved'
        AND t.scheduled_return_date < NOW()
        AND t.actual_return_date IS NULL
      ORDER BY t.scheduled_return_date ASC`
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error getting overdue transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving overdue transactions',
      error: (error as Error).message,
    });
  }
};

// Get user transactions
export const getUserTransactions = async (req: Request, res: Response) => {
  try {
    // If admin, allow specifying a user_id; otherwise, use the logged-in user's ID
    const userId = req.user.role === 'admin' && req.query.user_id ? req.query.user_id : req.user.userId;
    
    const result = await db.query(
      `SELECT t.*, 
             r.name as resource_name, 
             u.name as user_name 
      FROM transactions t
      JOIN resources r ON t.resource_id = r.id
      JOIN users u ON t.user_id = u.id
      WHERE t.user_id = $1
      ORDER BY t.created_at DESC
      LIMIT 20`,
      [userId]
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error getting user transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user transactions',
      error: (error as Error).message,
    });
  }
};

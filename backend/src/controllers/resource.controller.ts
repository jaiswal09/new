import { Request, Response } from 'express';
import getDbConnection from '../config/db';

const db = getDbConnection();

// Get all resources
export const getAllResources = async (req: Request, res: Response) => {
  try {
    const { category, status, search, limit = 20, page = 1 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = `
      SELECT r.*, c.name as category_name 
      FROM resources r
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE 1=1
    `;
    const queryParams: any[] = [];
    let paramCount = 1;
    
    // Add filter for category
    if (category) {
      query += ` AND r.category_id = $${paramCount++}`;
      queryParams.push(category);
    }
    
    // Add filter for status
    if (status) {
      query += ` AND r.status = $${paramCount++}`;
      queryParams.push(status);
    }
    
    // Add search functionality
    if (search) {
      query += ` AND (r.name ILIKE $${paramCount} OR r.description ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }
    
    // Add sorting and pagination
    query += ` ORDER BY r.name ASC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    queryParams.push(limit, offset);
    
    // Execute query
    const result = await db.query(query, queryParams);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM resources r
      WHERE 1=1
    `;
    
    paramCount = 1;
    const countParams: any[] = [];
    
    // Add filters to count query
    if (category) {
      countQuery += ` AND r.category_id = $${paramCount++}`;
      countParams.push(category);
    }
    
    if (status) {
      countQuery += ` AND r.status = $${paramCount++}`;
      countParams.push(status);
    }
    
    if (search) {
      countQuery += ` AND (r.name ILIKE $${paramCount} OR r.description ILIKE $${paramCount})`;
      countParams.push(`%${search}%`);
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
    console.error('Error getting resources:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving resources',
      error: (error as Error).message,
    });
  }
};

// Get single resource
export const getResourceById = async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT r.*, c.name as category_name 
       FROM resources r
       LEFT JOIN categories c ON r.category_id = c.id
       WHERE r.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Get recent transactions for this resource
    const transactions = await db.query(
      `SELECT t.*, u.name as user_name 
       FROM transactions t
       JOIN users u ON t.user_id = u.id
       WHERE t.resource_id = $1
       ORDER BY t.created_at DESC
       LIMIT 5`,
      [req.params.id]
    );

    // Get upcoming reservations for this resource
    const reservations = await db.query(
      `SELECT r.*, u.name as user_name 
       FROM reservations r
       JOIN users u ON r.user_id = u.id
       WHERE r.resource_id = $1 AND r.start_time > NOW()
       ORDER BY r.start_time ASC
       LIMIT 5`,
      [req.params.id]
    );

    const resource = {
      ...result.rows[0],
      transactions: transactions.rows,
      reservations: reservations.rows,
    };

    res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    console.error('Error getting resource:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving resource',
      error: (error as Error).message,
    });
  }
};

// Create a new resource
export const createResource = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      category_id,
      quantity,
      unit_cost,
      location,
      min_quantity,
      expiry_date,
      image_url,
      barcode,
      rfid,
    } = req.body;

    // Determine status based on quantity and min_quantity
    let status = 'available';
    if (quantity === 0) {
      status = 'out_of_stock';
    } else if (quantity <= min_quantity) {
      status = 'low_stock';
    }

    // Create resource
    const result = await db.query(
      `INSERT INTO resources 
       (name, description, category_id, quantity, unit_cost, location, status, 
        min_quantity, expiry_date, image_url, barcode, rfid, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
       RETURNING *`,
      [
        name,
        description,
        category_id,
        quantity,
        unit_cost,
        location,
        status,
        min_quantity || 5,
        expiry_date,
        image_url,
        barcode,
        rfid,
        req.user.userId,
      ]
    );

    // Create audit log
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [
        req.user.userId,
        'resource_create',
        'resources',
        result.rows[0].id,
        JSON.stringify({ name, category_id, quantity }),
      ]
    );

    // Create transaction record for initial addition
    if (quantity > 0) {
      await db.query(
        `INSERT INTO transactions 
         (resource_id, user_id, transaction_type, quantity, status, notes) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          result.rows[0].id,
          req.user.userId,
          'addition',
          quantity,
          'completed',
          'Initial inventory addition',
        ]
      );
    }

    // Create notification for admin about new resource
    // Get admin users
    const admins = await db.query('SELECT id FROM users WHERE role = $1', ['admin']);
    
    // Create notification for each admin
    for (const admin of admins.rows) {
      await db.query(
        `INSERT INTO notifications 
         (user_id, title, message, type, related_entity_type, related_entity_id) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          admin.id,
          'New Resource Added',
          `${name} has been added to inventory with quantity ${quantity}`,
          'resource_added',
          'resources',
          result.rows[0].id,
        ]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating resource',
      error: (error as Error).message,
    });
  }
};

// Update a resource
export const updateResource = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      category_id,
      quantity,
      unit_cost,
      location,
      min_quantity,
      expiry_date,
      image_url,
      barcode,
      rfid,
    } = req.body;

    // Get the current resource to compare changes
    const currentResource = await db.query('SELECT * FROM resources WHERE id = $1', [req.params.id]);

    if (currentResource.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    const oldResource = currentResource.rows[0];

    // Determine if quantity has changed
    const quantityChanged = quantity !== undefined && quantity !== oldResource.quantity;
    
    // Determine status based on quantity and min_quantity
    let status = oldResource.status;
    if (quantity !== undefined) {
      if (quantity === 0) {
        status = 'out_of_stock';
      } else if (quantity <= (min_quantity || oldResource.min_quantity)) {
        status = 'low_stock';
      } else {
        status = 'available';
      }
    }

    // Build the update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }

    if (category_id !== undefined) {
      updates.push(`category_id = $${paramCount++}`);
      values.push(category_id);
    }

    if (quantity !== undefined) {
      updates.push(`quantity = $${paramCount++}`);
      values.push(quantity);
    }

    if (unit_cost !== undefined) {
      updates.push(`unit_cost = $${paramCount++}`);
      values.push(unit_cost);
    }

    if (location !== undefined) {
      updates.push(`location = $${paramCount++}`);
      values.push(location);
    }

    if (min_quantity !== undefined) {
      updates.push(`min_quantity = $${paramCount++}`);
      values.push(min_quantity);
    }

    if (expiry_date !== undefined) {
      updates.push(`expiry_date = $${paramCount++}`);
      values.push(expiry_date);
    }

    if (image_url !== undefined) {
      updates.push(`image_url = $${paramCount++}`);
      values.push(image_url);
    }

    if (barcode !== undefined) {
      updates.push(`barcode = $${paramCount++}`);
      values.push(barcode);
    }

    if (rfid !== undefined) {
      updates.push(`rfid = $${paramCount++}`);
      values.push(rfid);
    }

    // Always update status based on our calculation
    updates.push(`status = $${paramCount++}`);
    values.push(status);

    // Add the id as the last parameter
    values.push(req.params.id);

    // If no fields to update, return success with the current resource
    if (updates.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No changes to update',
        data: oldResource,
      });
    }

    // Update the resource
    const result = await db.query(
      `UPDATE resources SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`,
      values
    );

    // Create audit log
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [
        req.user.userId,
        'resource_update',
        'resources',
        req.params.id,
        JSON.stringify({
          before: {
            name: oldResource.name,
            quantity: oldResource.quantity,
            status: oldResource.status,
          },
          after: {
            name: name || oldResource.name,
            quantity: quantity !== undefined ? quantity : oldResource.quantity,
            status,
          },
        }),
      ]
    );

    // If quantity has changed, create a transaction record
    if (quantityChanged) {
      const transactionType = quantity > oldResource.quantity ? 'addition' : 'removal';
      const transactionQuantity = Math.abs(quantity - oldResource.quantity);

      await db.query(
        `INSERT INTO transactions 
         (resource_id, user_id, transaction_type, quantity, status, notes) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          req.params.id,
          req.user.userId,
          transactionType,
          transactionQuantity,
          'completed',
          `Quantity ${transactionType === 'addition' ? 'increased' : 'decreased'} during update`,
        ]
      );

      // If status changed to low_stock, create notifications
      if (status === 'low_stock' && oldResource.status !== 'low_stock') {
        // Get admin users
        const admins = await db.query('SELECT id FROM users WHERE role = $1', ['admin']);
        
        // Create notification for each admin
        for (const admin of admins.rows) {
          await db.query(
            `INSERT INTO notifications 
             (user_id, title, message, type, related_entity_type, related_entity_id) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              admin.id,
              'Low Stock Alert',
              `${result.rows[0].name} inventory is low (${quantity} remaining)`,
              'low_stock',
              'resources',
              req.params.id,
            ]
          );
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Resource updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating resource',
      error: (error as Error).message,
    });
  }
};

// Delete a resource
export const deleteResource = async (req: Request, res: Response) => {
  try {
    // Check if resource exists
    const resourceCheck = await db.query('SELECT * FROM resources WHERE id = $1', [req.params.id]);

    if (resourceCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Check if resource has active transactions or reservations
    const activeTransactions = await db.query(
      `SELECT COUNT(*) FROM transactions 
       WHERE resource_id = $1 AND status NOT IN ('completed', 'rejected')`,
      [req.params.id]
    );

    const activeReservations = await db.query(
      `SELECT COUNT(*) FROM reservations 
       WHERE resource_id = $1 AND status NOT IN ('completed', 'rejected', 'cancelled')`,
      [req.params.id]
    );

    if (
      parseInt(activeTransactions.rows[0].count) > 0 ||
      parseInt(activeReservations.rows[0].count) > 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete resource with active transactions or reservations',
      });
    }

    // Create audit log before deletion
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [
        req.user.userId,
        'resource_delete',
        'resources',
        req.params.id,
        JSON.stringify(resourceCheck.rows[0]),
      ]
    );

    // Delete the resource
    await db.query('DELETE FROM resources WHERE id = $1', [req.params.id]);

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting resource',
      error: (error as Error).message,
    });
  }
};

// Get low stock resources
export const getLowStockResources = async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT r.*, c.name as category_name 
       FROM resources r
       LEFT JOIN categories c ON r.category_id = c.id
       WHERE r.status = 'low_stock'
       ORDER BY r.quantity ASC`
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error getting low stock resources:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving low stock resources',
      error: (error as Error).message,
    });
  }
};

// Get resources by expiry date
export const getResourcesByExpiry = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    
    const result = await db.query(
      `SELECT r.*, c.name as category_name 
       FROM resources r
       LEFT JOIN categories c ON r.category_id = c.id
       WHERE r.expiry_date IS NOT NULL 
       AND r.expiry_date <= NOW() + INTERVAL '${days} days'
       ORDER BY r.expiry_date ASC`
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error getting resources by expiry:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving resources by expiry',
      error: (error as Error).message,
    });
  }
};

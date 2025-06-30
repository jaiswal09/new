import { Request, Response } from 'express';
import getDbConnection from '../config/db';

const db = getDbConnection();

// Get all categories
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const result = await db.query('SELECT * FROM categories ORDER BY name ASC');

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving categories',
      error: (error as Error).message,
    });
  }
};

// Get single category
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const result = await db.query('SELECT * FROM categories WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Get resources in this category
    const resources = await db.query(
      'SELECT * FROM resources WHERE category_id = $1 ORDER BY name ASC',
      [req.params.id]
    );

    const category = {
      ...result.rows[0],
      resources: resources.rows,
    };

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error getting category:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving category',
      error: (error as Error).message,
    });
  }
};

// Create a new category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    // Check if category already exists
    const categoryExists = await db.query('SELECT * FROM categories WHERE name = $1', [name]);

    if (categoryExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists',
      });
    }

    // Create category
    const result = await db.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );

    // Create audit log
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [
        req.user.userId,
        'category_create',
        'categories',
        result.rows[0].id,
        JSON.stringify({ name, description }),
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: (error as Error).message,
    });
  }
};

// Update a category
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    // Check if category exists
    const categoryExists = await db.query('SELECT * FROM categories WHERE id = $1', [req.params.id]);

    if (categoryExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // If updating name, check for duplicates
    if (name && name !== categoryExists.rows[0].name) {
      const nameExists = await db.query('SELECT * FROM categories WHERE name = $1 AND id != $2', [
        name,
        req.params.id,
      ]);

      if (nameExists.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists',
        });
      }
    }

    // Update category
    const result = await db.query(
      `UPDATE categories 
       SET name = $1, description = $2, updated_at = NOW() 
       WHERE id = $3 
       RETURNING *`,
      [name || categoryExists.rows[0].name, description || categoryExists.rows[0].description, req.params.id]
    );

    // Create audit log
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [
        req.user.userId,
        'category_update',
        'categories',
        req.params.id,
        JSON.stringify({
          before: {
            name: categoryExists.rows[0].name,
            description: categoryExists.rows[0].description,
          },
          after: {
            name: name || categoryExists.rows[0].name,
            description: description || categoryExists.rows[0].description,
          },
        }),
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: (error as Error).message,
    });
  }
};

// Delete a category
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    // Check if category exists
    const categoryExists = await db.query('SELECT * FROM categories WHERE id = $1', [req.params.id]);

    if (categoryExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Check if category has resources
    const resourcesCount = await db.query('SELECT COUNT(*) FROM resources WHERE category_id = $1', [
      req.params.id,
    ]);

    if (parseInt(resourcesCount.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with associated resources. Remove or reassign resources first.',
      });
    }

    // Create audit log before deletion
    await db.query(
      'INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [
        req.user.userId,
        'category_delete',
        'categories',
        req.params.id,
        JSON.stringify(categoryExists.rows[0]),
      ]
    );

    // Delete the category
    await db.query('DELETE FROM categories WHERE id = $1', [req.params.id]);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: (error as Error).message,
    });
  }
};

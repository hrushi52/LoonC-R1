const db = require('../db');

const createSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const listProperties = async (req, res) => {
  try {
    const sql = `
      SELECT p.*,
        (SELECT JSON_ARRAYAGG(
          JSON_OBJECT('id', pi.id, 'image_url', pi.image_url, 'display_order', pi.display_order)
        )
        FROM property_images pi
        WHERE pi.property_id = p.id
        ORDER BY pi.display_order ASC) as images
      FROM properties p
      ORDER BY p.created_at DESC
    `;

    const properties = await db.query(sql);

    res.json({
      success: true,
      data: properties.map(prop => ({
        ...prop,
        images: prop.images || []
      }))
    });
  } catch (error) {
    console.error('List properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties.'
    });
  }
};

const listPublicProperties = async (req, res) => {
  try {
    const sql = `
      SELECT p.*,
        (SELECT JSON_ARRAYAGG(
          JSON_OBJECT('id', pi.id, 'image_url', pi.image_url, 'display_order', pi.display_order)
        )
        FROM property_images pi
        WHERE pi.property_id = p.id
        ORDER BY pi.display_order ASC) as images
      FROM properties p
      WHERE p.is_active = TRUE
      ORDER BY p.is_top_selling DESC, p.created_at DESC
    `;

    const properties = await db.query(sql);

    res.json({
      success: true,
      data: properties.map(prop => ({
        ...prop,
        images: prop.images || []
      }))
    });
  } catch (error) {
    console.error('List public properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties.'
    });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    const propertySql = 'SELECT * FROM properties WHERE id = ?';
    const properties = await db.query(propertySql, [id]);

    if (properties.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.'
      });
    }

    const imagesSql = 'SELECT * FROM property_images WHERE property_id = ? ORDER BY display_order ASC';
    const images = await db.query(imagesSql, [id]);

    res.json({
      success: true,
      data: {
        ...properties[0],
        images
      }
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch property.'
    });
  }
};

const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
      price,
      price_note,
      capacity,
      max_capacity,
      rating,
      is_top_selling,
      is_active,
      check_in_time,
      check_out_time,
      contact,
      address,
      amenities,
      highlights,
      activities,
      policies,
      images
    } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title and category are required.'
      });
    }

    const slug = createSlug(title);

    const checkSlugSql = 'SELECT id FROM properties WHERE slug = ?';
    const existing = await db.query(checkSlugSql, [slug]);

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A property with this title already exists.'
      });
    }

    const insertSql = `
      INSERT INTO properties (
        title, slug, description, category, location, price, price_note,
        capacity, max_capacity, rating, is_top_selling, is_active,
        check_in_time, check_out_time, contact, address,
        amenities, highlights, activities, policies
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await db.query(insertSql, [
      title,
      slug,
      description || null,
      category,
      location || null,
      price || null,
      price_note || null,
      capacity || 4,
      max_capacity || null,
      rating || 4.5,
      is_top_selling ? 1 : 0,
      is_active !== false ? 1 : 0,
      check_in_time || '2:00 PM',
      check_out_time || '11:00 AM',
      contact || null,
      address || null,
      JSON.stringify(amenities || []),
      JSON.stringify(highlights || []),
      JSON.stringify(activities || []),
      JSON.stringify(policies || [])
    ]);

    const propertyId = result.insertId;

    if (images && images.length > 0) {
      const imageInsertSql = 'INSERT INTO property_images (property_id, image_url, display_order) VALUES (?, ?, ?)';

      for (let i = 0; i < images.length; i++) {
        await db.query(imageInsertSql, [propertyId, images[i], i]);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Property created successfully.',
      data: {
        id: propertyId,
        slug
      }
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create property.'
    });
  }
};

const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      location,
      price,
      price_note,
      capacity,
      max_capacity,
      rating,
      is_top_selling,
      is_active,
      check_in_time,
      check_out_time,
      contact,
      address,
      amenities,
      highlights,
      activities,
      policies,
      images
    } = req.body;

    const checkSql = 'SELECT slug FROM properties WHERE id = ?';
    const existing = await db.query(checkSql, [id]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.'
      });
    }

    let slug = existing[0].slug;

    if (title) {
      const newSlug = createSlug(title);
      if (newSlug !== slug) {
        const checkNewSlugSql = 'SELECT id FROM properties WHERE slug = ? AND id != ?';
        const slugExists = await db.query(checkNewSlugSql, [newSlug, id]);

        if (slugExists.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'A property with this title already exists.'
          });
        }
        slug = newSlug;
      }
    }

    const updateSql = `
      UPDATE properties SET
        title = COALESCE(?, title),
        slug = ?,
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        location = COALESCE(?, location),
        price = COALESCE(?, price),
        price_note = COALESCE(?, price_note),
        capacity = COALESCE(?, capacity),
        max_capacity = COALESCE(?, max_capacity),
        rating = COALESCE(?, rating),
        is_top_selling = COALESCE(?, is_top_selling),
        is_active = COALESCE(?, is_active),
        check_in_time = COALESCE(?, check_in_time),
        check_out_time = COALESCE(?, check_out_time),
        contact = COALESCE(?, contact),
        address = COALESCE(?, address),
        amenities = COALESCE(?, amenities),
        highlights = COALESCE(?, highlights),
        activities = COALESCE(?, activities),
        policies = COALESCE(?, policies)
      WHERE id = ?
    `;

    await db.query(updateSql, [
      title || null,
      slug,
      description || null,
      category || null,
      location || null,
      price || null,
      price_note || null,
      capacity || null,
      max_capacity || null,
      rating || null,
      is_top_selling !== undefined ? (is_top_selling ? 1 : 0) : null,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      check_in_time || null,
      check_out_time || null,
      contact || null,
      address || null,
      amenities ? JSON.stringify(amenities) : null,
      highlights ? JSON.stringify(highlights) : null,
      activities ? JSON.stringify(activities) : null,
      policies ? JSON.stringify(policies) : null,
      id
    ]);

    if (images !== undefined) {
      await db.query('DELETE FROM property_images WHERE property_id = ?', [id]);

      if (images.length > 0) {
        const imageInsertSql = 'INSERT INTO property_images (property_id, image_url, display_order) VALUES (?, ?, ?)';

        for (let i = 0; i < images.length; i++) {
          await db.query(imageInsertSql, [id, images[i], i]);
        }
      }
    }

    res.json({
      success: true,
      message: 'Property updated successfully.'
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update property.'
    });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const checkSql = 'SELECT id FROM properties WHERE id = ?';
    const existing = await db.query(checkSql, [id]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.'
      });
    }

    await db.query('DELETE FROM properties WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Property deleted successfully.'
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete property.'
    });
  }
};

const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { field, value } = req.body;

    if (!['is_active', 'is_top_selling'].includes(field)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid field. Must be is_active or is_top_selling.'
      });
    }

    const sql = `UPDATE properties SET ${field} = ? WHERE id = ?`;
    const result = await db.query(sql, [value ? 1 : 0, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.'
      });
    }

    res.json({
      success: true,
      message: 'Property status updated successfully.'
    });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update property status.'
    });
  }
};

module.exports = {
  listProperties,
  listPublicProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  toggleStatus
};

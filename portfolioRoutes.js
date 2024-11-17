const express = require('express');
const router = express.Router();
const PortfolioItem = require('../models/portfolioItem');
const User = require('../models/user');

// Create portfolio item
router.post('/portfolio', async (req, res) => {
  const { title, description, images } = req.body;
  const newItem = new PortfolioItem({
    title,
    description,
    images
  });

  await newItem.save();
  res.redirect('/');
});

// Edit portfolio item (admin only)
router.put('/portfolio/:id', async (req, res) => {
  if (req.session.role !== 'admin') {
    return res.status(403).send('Access denied');
  }

  const { title, description, images } = req.body;
  await PortfolioItem.findByIdAndUpdate(req.params.id, {
    title,
    description,
    images,
    updatedAt: Date.now()
  });

  res.redirect('/');
});

// Delete portfolio item (admin only)
router.delete('/portfolio/:id', async (req, res) => {
  if (req.session.role !== 'admin') {
    return res.status(403).send('Access denied');
  }

  await PortfolioItem.findByIdAndDelete(req.params.id);
  res.redirect('/');
});

module.exports = router;

import PortfolioItem from "../models/portfolioModel.js";

export const createPortfolioItem = async (req, res) => {
  try {
    const { title, description, images, createdBy } = req.body;

    if (!title || !description || !images || images.length < 3) {
      return res.status(400).json({ message: "All fields are required, and at least 3 images must be provided." });
    }

    const newPortfolioItem = new PortfolioItem({ title, description, images, createdBy });
    const savedItem = await newPortfolioItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPortfolioItems = async (req, res) => {
  try {
    const items = await PortfolioItem.find();
    if (items.length === 0) {
      return res.status(404).json({ message: "No portfolio items found" });
    }
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPortfolioItemById = async (req, res) => {
  try {
    const id = req.params.id;
    const item = await PortfolioItem.findById(id);
    if (!item) {
      return res.status(404).json({ error: "Portfolio item not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updatePortfolioItem = async (req, res) => {
  try {
    const id = req.params.id;
    const { title, description, images, updatedBy } = req.body;

    const item = await PortfolioItem.findById(id);
    if (!item) {
      return res.status(404).json({ error: "Portfolio item not found" });
    }

    if (updatedBy !== "admin") {
      return res.status(403).json({ message: "Only admins can update portfolio items." });
    }

    item.title = title || item.title;
    item.description = description || item.description;
    item.images = images || item.images;

    const updatedItem = await item.save();
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deletePortfolioItem = async (req, res) => {
  try {
    const id = req.params.id;
    const { deletedBy } = req.body;

    const item = await PortfolioItem.findById(id);
    if (!item) {
      return res.status(404).json({ error: "Portfolio item not found" });
    }

    if (deletedBy !== "admin") {
      return res.status(403).json({ message: "Only admins can delete portfolio items." });
    }

    await PortfolioItem.findByIdAndDelete(id);
    res.status(200).json({ message: "Portfolio item deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

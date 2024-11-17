const Item = require('../models/portfolioItem');

// Получить все элементы портфолио
exports.getPortfolio = async (req, res) => {
    const items = await Item.find();
    res.render('index', { portfolioItems: items });
};

// Добавить новый элемент портфолио
exports.addItem = async (req, res) => {
    const { title, description, image1, image2, image3 } = req.body;
    const newItem = new Item({ title, description, image1, image2, image3 });
    await newItem.save();
    res.redirect('/');
};

// Удалить элемент портфолио
exports.deleteItem = async (req, res) => {
    const itemId = req.params.id;
    await Item.findByIdAndDelete(itemId);
    res.redirect('/');
};

// Обновить элемент портфолио
exports.updateItem = async (req, res) => {
    const itemId = req.params.id;
    const { title, description, image1, image2, image3 } = req.body;
    await Item.findByIdAndUpdate(itemId, { title, description, image1, image2, image3 });
    res.redirect('/');
};

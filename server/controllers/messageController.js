const Messages = require("../models/messageModel");

module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    if (!from || !to) {
      return res.status(400).json({ msg: "Sender (from) and recipient (to) IDs are required" });
    }

    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ createdAt: 1 });

    const projectedMessages = messages.map((msg) => {
      return {
        id: msg._id,
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
        createdAt: msg.createdAt,
      };
    });
    return res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;

    if (!from || !to || !message || !message.trim()) {
      return res.status(400).json({ msg: "Sender, recipient, and non-empty message text are required" });
    }

    const data = await Messages.create({
      message: { text: message.trim() },
      users: [from, to],
      sender: from,
    });

    if (data) {
      return res.json({
        status: true,
        msg: "Message added successfully.",
        data: {
          id: data._id,
          message: data.message.text,
          createdAt: data.createdAt,
        },
      });
    } else {
      return res.status(500).json({ status: false, msg: "Failed to add message to the database" });
    }
  } catch (ex) {
    next(ex);
  }
};

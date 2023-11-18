const Contact = require("../models/contacts");
const { HttpError } = require("../helpers");

async function getContacts(req, res, next) {
  try {
    const contacts = await Contact.find().exec();
    res.status(200).send(contacts);
  } catch (error) {
    next(error);
  }
}

async function getContact(req, res, next) {
  try {
    const { contactId } = req.params;
    const contact = await Contact.findById(contactId).exec();
    if (contact === null) {
      return res.status(404).send("Not found");
    }
    res.status(200).send(contact);
  } catch (error) {
    next(error);
  }
}

async function createContact(req, res, next) {
  const contact = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    favorite: req.body.favorite,
  };
  try {
    if (!contact) {
      throw HttpError(400, message.error);
    }
    const result = await Contact.create(contact);
    res.status(201).send(result);
  } catch (error) {
    next(error);
  }
}

async function updateContact(req, res, next) {
  const { contactId } = req.params;
  const contact = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    favorite: req.body.favorite,
  };
  try {
    if (!contact) {
      throw HttpError(400, message.error);
    }
    const result = await Contact.findByIdAndUpdate(contactId, contact, {
      new: true,
    });
    if (result === null) {
      throw HttpError(404, "Not found");
    }
    res.send(result);
  } catch (error) {
    next(error);
  }
}
async function deleteContact(req, res, next) {
  const { contactId } = req.params;
  try {
    const result = await Contact.findByIdAndDelete(contactId);
    if (result === null) {
      throw HttpError(404, "Not found");
    }
    res.send({ contactId });
  } catch (error) {
    next(error);
  }
}

async function updateStatusContact(req, res, next) {
  const { contactId } = req.params;
  const body = {
    favorite: req.body.favorite,
  };
  try {
    if (Object.keys(body).length === 0) {
      throw HttpError(400, "missing field favorite");
    }
    const result = await Contact.findByIdAndUpdate(contactId, body, {
      new: true,
    });
    if (result === null) {
      throw HttpError(404, "Not found");
    }
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  updateStatusContact,
};

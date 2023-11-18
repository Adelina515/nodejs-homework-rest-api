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
    if (!req.body || Object.keys(req.body).length === 0) {
      throw HttpError(400, "missing required  field");
    }
    if (!req.body.name) {
      missingFields.push("name");
    }

    if (!req.body.email) {
      missingFields.push("email");
    }

    if (!req.body.phone) {
      missingFields.push("phone");
    }

    if (!req.body.favorite) {
      missingFields.push("favorite");
    }

    if (missingFields.length > 0) {
      const errorMessage = `missing required  ${missingFields.join(
        ", "
      )} field`;
      throw HttpError(400, errorMessage);
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
    const missingFields = [];

    if (!req.body || Object.keys(req.body).length === 0) {
      throw HttpError(400, "Missing fields");
    }

    if (!req.body.name) {
      missingFields.push("name");
    }

    if (!req.body.email) {
      missingFields.push("email");
    }

    if (!req.body.phone) {
      missingFields.push("phone");
    }

    if (!req.body.favorite) {
      missingFields.push("favorite");
    }

    if (missingFields.length > 0) {
      const errorMessage = `Missing fields: ${missingFields.join(", ")}`;
      throw HttpError(400, errorMessage);
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
  try {
    if (Object.keys(req.body).length === 0) {
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

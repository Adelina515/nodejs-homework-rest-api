const express = require("express");

const router = express.Router();
const ContactController = require("../../controllers/contact");
const jsonParser = express.json();
const isValidId = require("../../middellwares");

router.get("/", ContactController.getContacts);

router.get("/:contactId", isValidId, ContactController.getContact);

router.post("/", jsonParser, ContactController.createContact);

router.delete("/:contactId", isValidId, ContactController.deleteContact);

router.put(
  "/:contactId",
  isValidId,
  jsonParser,
  ContactController.updateContact
);
router.patch(
  "/:contactId/favorite",
  isValidId,
  jsonParser,
  ContactController.updateStatusContact
);

module.exports = router;

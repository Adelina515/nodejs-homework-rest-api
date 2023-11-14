const express = require("express");

const router = express.Router();
const ContactController = require("../../controllers/contact");
const jsonParser = express.json();

router.get("/", ContactController.getContacts);

router.get("/:contactId", ContactController.getContact);

router.post("/", jsonParser, ContactController.createContact);

router.delete("/:contactId", ContactController.deleteContact);

router.put("/:contactId", jsonParser, ContactController.updateContact);
router.patch(
  "/:contactId/favorite",
  jsonParser,
  ContactController.updateStatusContact
);

module.exports = router;

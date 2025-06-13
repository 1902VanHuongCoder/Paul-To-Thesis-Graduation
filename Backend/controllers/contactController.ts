import { Request, Response } from "express";
import Contact from "../models/Contact";

// Create a new contact message
export const createContact = async (req: Request, res: Response) => {
  const { userID, subject, message } = req.body;
  try {
    const contact = await Contact.create({
      userID,
      subject,
      message,
      status: "open",
    });
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Get all contact messages (admin)
export const getAllContacts = async (_req: Request, res: Response) => {
  try {
    const contacts = await Contact.findAll({ order: [["createdAt", "DESC"]] });
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Get a single contact message by ID
export const getContactById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { contactID } = req.params;
  try {
    const contact = await Contact.findByPk(contactID);
    if (!contact) {
      res.status(404).json({ message: "Contact not found" });
    } else {
      res.status(200).json(contact);
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Update contact status (e.g., mark as closed)
export const updateContactStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { contactID } = req.params;
  const { status } = req.body;
  try {
    const contact = await Contact.findByPk(contactID);
    if (!contact) {
      res.status(404).json({ message: "Contact not found" });
    } else {
      contact.status = status;
      await contact.save();
      res.status(200).json(contact);
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

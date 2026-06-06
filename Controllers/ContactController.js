import ContactUS from "../Models/ContactUSmodel.js";


// submit Contact 
export const SubmitContact = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        const userId = req.user.id;

        if (!name || !email || !phone || !message) {
            return res.status(400).json({ message: "Name , Email, Phone and Message are required" });
        }

        const contact = new ContactUS({
            user: userId,
            name,
            email,
            phone,
            message
        })
        await contact.save()

        res.status(201).json({ message: "Form submitted successfully!" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}



// get all contact
export const GetAllContact = async (req, res) => {
    try {
        const contact = await ContactUS.find().populate("user", "name email")
        res.status(200).json(contact);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

// Delete Contact
export const DeleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        const contact = await ContactUS.findByIdAndDelete(id)

        if (!contact) {
            return res.status(404).json({ message: "Contact not found" });
        }

        res.status(200).json({ message: "Contact Message deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}
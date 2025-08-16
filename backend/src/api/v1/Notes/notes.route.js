import express from "express";
import auth from "../../../middlewares/auth.middleware";
import { NoteController } from "./notes.controller";
const router = express.Router();
router.post("/", auth, NoteController.uploadNotes);
router.get('/noteslist',auth,NoteController.getNotes)
router.delete("/deletenote/:id", auth, NoteController.deleteNote);
export default router;

import httpStatus from "http-status";
import Notes from './notes.model.js'
import createResponse from "../../../utils/response.js";
import mongoose from "mongoose";
import User from "../User/user.model.js";
import batchModel from "../Batch/batch.model.js";
import requestModel from "../BatchRequest/request.model.js";
import userprofileModel from "../User-Profile/userprofile.model.js";
const uploadNotes = async (req, res) => {
  try {
    const { classIds, subjectIds, fileUrl,title } = req.body;

    // Validate input
    if (!Array.isArray(classIds) || classIds.length === 0) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: "Invalid or empty class ID array",
      });
    }

    if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: "Invalid or empty subject ID array",
      });
    }

    const invalidClassIds = classIds.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );
    if (invalidClassIds.length > 0) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: `Invalid class ID(s): ${invalidClassIds.join(", ")}`,
      });
    }

    const invalidSubjectIds = subjectIds.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );
    if (invalidSubjectIds.length > 0) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: `Invalid subject ID(s): ${invalidSubjectIds.join(", ")}`,
      });
    }

    if (!req.user || !mongoose.Types.ObjectId.isValid(req.user._id)) {
      return createResponse({
        res,
        statusCode: httpStatus.UNAUTHORIZED,
        status: false,
        message: "User not authenticated or invalid user ID",
      });
    }

    if (!fileUrl || typeof fileUrl !== "string") {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: "Invalid or missing file URL",
      });
    }

  

    // Save note to MongoDB
    const note = new Notes({
      notes: [{ url: fileUrl,title :title}],
      uploadedBy: req.user._id,
      classId: classIds,
      subjectId: subjectIds,
    });
    await note.save();

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: "Note uploaded successfully.",
      data: { noteId: note._id, url: fileUrl },
    });
  } catch (error) {
    console.error("Error in uploadNotes:", error);
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: error.message || "Internal server error",
    });
  }
};
const getNotes = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { subjectId, classId } = req.query;

    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return createResponse({
        res,
        statusCode: httpStatus.UNAUTHORIZED,
        status: false,
        message: 'Invalid user ID',
      });
    }

    if (!subjectId || !mongoose.Types.ObjectId.isValid(subjectId)) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid or missing subject ID',
      });
    }

    if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: 'Invalid or missing class ID',
      });
    }

    // Fetch user
    const user = await User.findById(userId);
    if (!user) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'User not found',
      });
    }

    // Fetch notes based on user role
    let notesData;
    if (user.userRole === 'teacher') {
      // Teachers can access their own uploaded notes
      notesData = await Notes.find({
        uploadedBy: userId,
        classId: classId,
        subjectId: subjectId,
      })
        .populate({
          path: 'classId',
          select: 'nameEn _id',
        })
        .populate({
          path: 'subjectId',
          select: 'nameEn _id',
        });
    } else {
      // Non-teachers (e.g., students) should only access notes from their approved batch's class teacher
      const userProfile = await userprofileModel.findOne({ userId });
      if (!userProfile || !userProfile.joinedBatch) {
        return createResponse({
          res,
          statusCode: httpStatus.BAD_REQUEST,
          status: false,
          message: 'User has not joined any batch',
        });
      }

      // Verify the user is approved in the batch
      const joinedBatch = await requestModel.findOne({
        batchId: userProfile.joinedBatch,
        userId,
        approve: true,
      });
      if (!joinedBatch) {
        return createResponse({
          res,
          statusCode: httpStatus.FORBIDDEN,
          status: false,
          message: 'User is not approved for this batch',
        });
      }

      // Fetch batch data to get the class teacher
      const batchData = await batchModel.findOne({
        _id: userProfile.joinedBatch,
        classId, // Ensure the batch corresponds to the requested class
      });
      if (!batchData || !batchData.classTeacherId) {
        return createResponse({
          res,
          statusCode: httpStatus.NOT_FOUND,
          status: false,
          message: 'Batch or class teacher not found',
        });
      }

      // Fetch notes uploaded by the class teacher for the specified class and subject
      notesData = await Notes.find({
        uploadedBy: batchData.classTeacherId,
        classId,
        subjectId,
      })
        .populate({
          path: 'classId',
          select: 'nameEn _id',
        })
        .populate({
          path: 'subjectId',
          select: 'nameEn _id',
        });
    }

    if (!notesData || notesData.length === 0) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: 'No notes found for the specified class and subject',
      });
    }

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: 'Notes retrieved successfully',
      data: notesData,
    });
  } catch (error) {
    console.error('Error in getNotes:', error);
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: error.message || 'Internal server error',
    });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { id } = req.params;

    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return createResponse({
        res,
        statusCode: httpStatus.UNAUTHORIZED,
        status: false,
        message: "Invalid user ID",
      });
    }

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return createResponse({
        res,
        statusCode: httpStatus.BAD_REQUEST,
        status: false,
        message: "Invalid or missing note ID",
      });
    }

    // Fetch user and verify role
    const user = await User.findById(userId);
    if (!user) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: "User not found",
      });
    }

    if (user.userRole !== "teacher") {
      return createResponse({
        res,
        statusCode: httpStatus.FORBIDDEN,
        status: false,
        message: "Only teachers can delete notes",
      });
    }

    // Fetch note and verify ownership
    const note = await Notes.findById(id);
    if (!note) {
      return createResponse({
        res,
        statusCode: httpStatus.NOT_FOUND,
        status: false,
        message: "Note not found",
      });
    }

    if (note.uploadedBy.toString() !== userId.toString()) {
      return createResponse({
        res,
        statusCode: httpStatus.FORBIDDEN,
        status: false,
        message: "You are not authorized to delete this note",
      });
    }

    // Delete the note
    await Notes.findByIdAndDelete(id);

    return createResponse({
      res,
      statusCode: httpStatus.OK,
      status: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteNote:", error);
    return createResponse({
      res,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      status: false,
      message: error.message || "Internal server error",
    });
  }
};
export const NoteController = {
  uploadNotes,
  getNotes,
  deleteNote,
};
// import Profile from './profile.model';
// import userprofileModel from '../User-Profile/userprofile.model';
// import User from '../User/user.model';
// import httpStatus from 'http-status';
// import createResponse from '../../../utils/response';

// import { profileCreateSchema, profileUpdateSchema } from './profile.validator';
// import validateProfile from '../User-Profile/userprofile.validator';



// function removeUndefinedKeys(obj) {
//   return Object.fromEntries(
//     Object.entries(obj).filter(([_, value]) => value !== undefined)
//   );
// }

// const getProfile = async (req, res) => {
//   try {
//     const { id } = req.user;
//     const profile = await userprofileModel.findOne({ userId: id })
//       .select('userId picture role classId sections subjectId institution') 
//       .populate({
//         path: 'userId',
//         select: 'name email mobile', 
//       })
//       .lean();
//       console.log(profile,'prof')
//     return createResponse({
//       res,
//       statusCode: httpStatus.OK,
//       status: true,
//       message: 'Profile fetched',
//       data: {
//         userDetails: {
//           name: profile?.userId?.name?.english,
//           email: profile?.userId?.email,
//           mobile: profile?.userId?.mobile,
//           role: profile?.role,
//           class: profile?.classId?.nameEn,
//         },
//         picture: profile?.picture,
//         class: profile?.classId?.length > 0,
//         section: profile?.sections?.length > 0,
//         subject: profile?.subjectId?.length > 0,
//         institutionRequired: profile?.role === 'teacher',
//         institution:
//           profile?.role === 'teacher' ? !!profile?.institution : true,
//       },
//     });
//   } catch (error) {
    
//     const isValidation = error.name === 'ValidationError';
//     return createResponse({
//       res,
//       statusCode: isValidation
//         ? httpStatus.BAD_REQUEST
//         : httpStatus.INTERNAL_SERVER_ERROR,
//       status: false,
//       message: isValidation ? 'Validation failed' : 'Internal server error',
//       error: isValidation ? error.errors : error.message,
//     });
//   }
// };


// // eslint-disable-next-line import/prefer-default-export
// export const profileController = {
//   createOrUpdateProfile,
//   getProfile  
// };

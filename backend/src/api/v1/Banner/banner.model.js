import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
   
    bannersName: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,

    },
    imageUrl: {
      type: String,
      
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    images: [
      {
        url: { type: String },
        name: { type: String }
      }
    ],
    redirectPath: {
      type: String,
      
      trim: true,
    },
    status: { type: String },
  },
  {
    timestamps: true,
  }
);

bannerSchema.statics.isCodeTaken = async function (codee, excludeBannerId) {
  const banner = await this.findOne({ codee, _id: { $ne: excludeBannerId } });
  return !!banner;
};

const Banner = mongoose.model('Banner', bannerSchema);

export default Banner; 
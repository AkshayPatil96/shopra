import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

const ImageSchema = new Schema({
  fileId: {
    type: String,
    required: true,
    unique: true,
  },
  url: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export const Image = models.Image || model('Image', ImageSchema);

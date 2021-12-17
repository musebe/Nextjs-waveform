// Import the v2 api and rename it to cloudinary
import { v2 as cloudinary, TransformationOptions } from "cloudinary";

// Initialize the sdk with cloud_name, api_key and api_secret
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

/**
 * Cloudinary folder where videos will be uploaded to
 */
const CLOUDINARY_FOLDER_NAME = "audio-waveform-videos/";

/**
 * Gets a resource from cloudinary using it's public id
 *
 * @param {string} publicId The public id of the video
 */
export const getUploadedResource = (publicId) => {
  return cloudinary.api.resource(publicId, {
    resource_type: "video",
    type: "upload",
  });
};

/**
 * Get cloudinary uploads
 * @param {string} folder Folder name
 * @returns {Promise}
 */
export const getUploadedResources = (folder = CLOUDINARY_FOLDER_NAME) => {
  return cloudinary.api.resources({
    type: "upload",
    prefix: folder,
    resource_type: "video",
  });
};

/**
 * @typedef {Object} Resource
 * @property {string | Buffer} file
 * @property {string} publicId
 * @property {boolean} inFolder
 * @property {string} folder
 * @property {TransformationOptions} transformation
 *
 */

/**
 * Uploads a video to cloudinary and returns the upload result
 *
 * @param {Resource} resource
 */
export const uploadResource = ({
  file,
  publicId,
  transformation,
  folder = CLOUDINARY_FOLDER_NAME,
  inFolder = false,
}) => {
  return cloudinary.uploader.upload(file, {
    // Folder to store video in
    folder: inFolder ? folder : null,
    // Public id of video.
    public_id: publicId,
    // Type of resource
    resource_type: "auto",
    // Transformation to apply to the video
    transformation,
  });
};

/**
 * Deletes resources from cloudinary. Takes in an array of public ids
 * @param {string[]} ids
 */
export const deleteResources = (ids) => {
  return cloudinary.api.delete_resources(ids, {
    resource_type: "video",
  });
};

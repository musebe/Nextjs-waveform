import { NextApiRequest, NextApiResponse } from "next";
import { deleteResources, getUploadedResource } from "../../../lib/cloudinary";

/**
 *
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
 */
export default async function handler(req, res) {
  const id = Array.isArray(req.query.id)
    ? req.query.id.join("/")
    : req.query.id;

  switch (req.method) {
    case "GET": {
      try {
        const result = await handleGetRequest(id);

        return res.status(200).json({ message: "Success", result });
      } catch (error) {
        console.error(error);
        return res.status(400).json({ message: "Error", error });
      }
    }

    case "DELETE": {
      try {
        const result = await handleDeleteRequest(id);

        return res.status(200).json({ message: "Success", result });
      } catch (error) {
        console.error(error);
        return res.status(400).json({ message: "Error", error });
      }
    }

    default: {
      return res.status(405).json({ message: "Method Not Allowed" });
    }
  }
}

/**
 * Gets a sindle resource from Cloudinary.
 *
 * @param {string} id Public ID of the video to get
 */
const handleGetRequest = async (id) => {
  const upload = await getUploadedResource(id);

  return upload;
};

/**
 * Handles the DELETE request to the API route.
 *
 * @param {string} id Public ID of the video to delete
 */
const handleDeleteRequest = (id) => {
  // Delete the uploaded image from Cloudinary
  return deleteResources([id]);
};

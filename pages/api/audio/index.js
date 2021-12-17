import { promises as fs } from "fs";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { getMetadata, visualizeAudio } from "../../../lib/audio";
import { uploadResource } from "../../../lib/cloudinary";
import { parseForm } from "../../../lib/parse-form";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

/**
 * @type {NextApiHandler}
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
 */
export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "POST": {
      try {
        const result = await handlePostRequest(req);

        return res.status(201).json({
          message: "Success",
          result,
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({
          message: "Error",
          error,
        });
      }
    }

    default: {
      return res.status(405).json({ message: "Method not allowed" });
    }
  }
}

/**
 *
 * @param {NextApiRequest} req
 */
const handlePostRequest = async (req) => {
  // Get the form data using the parseForm function
  const data = await parseForm(req);

  const audio = data.files.audio;

  const metadata = await getMetadata(audio.filepath);

  const { title: songTitle, artist: songArtist } = metadata.common;

  const outputPath = await visualizeAudio({
    file: audio,
    outputPath: `repository/videos/${audio.originalFilename}.mp4`,
    visualizerBackgroundImage: "public/images/base-background.png",
    onProgress: (progress) => {
      console.log(`${progress}% done`);
    },
  });

  const waveformVideoUploadResult = await uploadResource({
    file: outputPath,
    inFolder: true,
    transformation: [
      {
        background: "#1DB954",
        color: "#191414",
        overlay: {
          font_family: "Arial",
          font_size: "100",
          font_weight: "bold",
          font_style: "italic",
          text: songTitle ?? "The Song Name",
        },
      },
      {
        flags: "layer_apply",
        gravity: "north_west",
        x: "0.05",
        y: "0.06",
      },
      {
        background: "#1DB954",
        color: "#191414",
        overlay: {
          font_family: "Arial",
          font_size: "80",
          font_weight: "bold",
          font_style: "italic",
          text: songArtist ?? "Artist",
        },
      },
      {
        flags: "layer_apply",
        gravity: "north_west",
        x: "0.05",
        y: "0.20",
      },
    ],
  });

  await fs.unlink(outputPath);

  return waveformVideoUploadResult;
};

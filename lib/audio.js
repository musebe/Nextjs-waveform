import { renderAudioVisualizer } from "nodejs-audio-visualizer";
import { parseFile as parseAudioFile } from "music-metadata";
import { File } from "formidable";

/**
 * The uploaded audio file along with a few options
 *
 * @typedef {Object} Audio
 * @property { File} file
 * @property {string?} visualizerBackgroundImage
 * @property {string} outputPath
 * @property {(progress:number)=>void} onProgress
 *
 */

/**
 * Takes in an [Audio] object and returns a promise that resolves to the path of the output video
 * @param {Audio} audio
 */
export const visualizeAudio = async (audio) => {
  const {
    file,
    visualizerBackgroundImage = "public/images/base-background.png",
    outputPath,
    onProgress,
  } = audio;

  const exitCode = await renderAudioVisualizer(
    {
      image: {
        path: visualizerBackgroundImage,
      },
      audio: {
        path: file.filepath,
      },
      outVideo: {
        path: outputPath,
        spectrum: {
          width: "100%",
          height: "100%",
          rotation: "up",
        },
      },
    },
    onProgress
  );

  if (exitCode !== 0) {
    throw new Error("renderAudioVisualizer failed");
  }

  return outputPath;
};

/**
 * Extracts the metadata from the audio file.
 * @param {string} audioPath
 */
export const getMetadata = (audioPath) => parseAudioFile(audioPath);

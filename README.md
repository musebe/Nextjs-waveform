# Audio waveform data to video with Cloudinary and Next.js

## Introduction

Let's create a video visualization of an audio using it's waveform data. We're going to be using [nodejs-audio-visualizer](https://www.npmjs.com/package/nodejs-audio-visualizer), [Cloudinary](https://cloudinary.com/?ap=em) and [Next.js](https://nextjs.org/).

## Prerequisites and setup

**This tutorial assumes you have working knowledge of javascript and that you're familiar with the basics of Node.js and React.js.**

First thing is to ensure you already have Node.js and NPM installed on your development environment.

Let's start off by creating a new Next.js project. Run the following command in your terminal.

```bash
npx create-next-app audio-waveform-to-video
```

The command will create a basic project that we can get up and running with. There's a lot more options for features such as typescript. The [Next.js documentation](https://nextjs.org/docs) is a great place to refer to for more information.

### Cloudinary account and credentials

In case you haven't used cloudinary before, it's an amazing service that offers developers with an easy to use API for media upload, transformations, optimization and delivery. It's very easy to work with and they have some amazing [docs](https://cloudinary.com/documentation/).

Create a new account at [Cloudinary](https://cloudinary.com/?ap=em) if you do not have one then log in and navigate to the [console page](https://cloudinary.com/console) were you'll find your **Cloud name**, **API Key** and **API Secret**.

![Cloudinary Dashboard](https://res.cloudinary.com/hackit-africa/image/upload/v1623006780/cloudinary-dashboard.png "Cloudinary Dashboard")

Create a file named `.env.local` at the root of your project and paste the following code inside.

```env
CLOUD_NAME=YOUR_CLOUD_NAME
API_KEY=YOUR_API_KEY
API_SECRET=YOUR_API_SECRET
```

Replace `YOUR_CLOUD_NAME` `YOUR_API_KEY` and `YOUR_API_SECRET` with the **Cloud name**, **API Key** and **API Secret** values that we just got from the [cloudinary console page](https://cloudinary.com/console).

`CLOUD_NAME`, `API_KEY` and `API_SECRET` are now environment variables. Environment variables allow us to store sensitive and secret credentials away from our code. Just remember not to check the `.env.local` file into git or some other source control. Read more about Next.js support for environment variables in the [docs](https://nextjs.org/docs/basic-features/environment-variables).

### Dependencies and packages

We're going to be using the following packages.

- [cloudinary](https://www.npmjs.com/package/cloudinary)
- [formidable](https://www.npmjs.com/package/formidable)
- [nodejs-audio-visualizer](https://www.npmjs.com/package/nodejs-audio-visualizer)
- [music-metadata](https://www.npmjs.com/package/music-metadata)

With your terminal pointing to the root of your project, run the following command to install the dependencies.

```bash
npm install cloudinary formidable nodejs-audio-visualizer music-metadata
```


## Getting started

Paste the following code inside `styles/globals.css`

```css
a:hover {
  text-decoration: underline;
}

:root {
  --color-primary: #1db954;
  --color-danger: #ff0000;
}

.danger {
  color: var(--color-danger);
}

.button {
  background-color: var(--color-primary);
  border-radius: 5px;
  border: none;
  color: #000000;
  text-transform: uppercase;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 50px;
}

button.danger {
  color: #ffffff;
  background-color: var(--color-danger);
}

.button:hover:not([disabled]) {
  filter: brightness(96%);
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

```

Create a new folder called `components` at the root of your project and then create a new file called `Layout.js` inside the `components` folder.

```bash
mkdir components && touch components/Layout.js
```

Paste the following code inside `components/Layout.js`

```jsx
import Head from "next/head";
import Link from "next/link";

export default function Layout({ children }) {
  return (
    <div>
      <Head>
        <title>Audio waveform data to video</title>
        <meta name="description" content="Audio waveform data to video" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav>
        <Link href="/">
          <a>Home</a>
        </Link>
        <Link href="/videos">
          <a>Videos</a>
        </Link>
      </nav>

      <main>{children}</main>
      <style jsx>{`
        nav {
          height: 100px;
          background-color: var(--color-primary);
          display: flex;
          flex-flow: row wrap;
          justify-content: center;
          align-items: center;
          gap: 10px;
        }

        nav a {
          font-weight: bold;
          letter-spacing: 1px;
        }

        main {
          min-height: calc(100vh- 100px);
          background-color: #f4f4f4;
        }
      `}</style>
    </div>
  );
}

```

This is a layout component. We're going to be using it to wrap all our pages. This avoids some code duplication and allows for a consistent layout. 

> HINT! You can replace the `.js` extension on client side components with `.jsx` for some better code completion and intellisense

Replace the code inside `pages/index.js` with the following.

```jsx
import { useState } from "react";
import Layout from "../components/Layout";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  /**
   * @type {[File, (file:File)=>void]}
   */
  const [audio, setAudio] = useState(null);

  /**
   * @type {[boolean, (uploading:boolean)=>void]}
   */
  const [uploadInProgress, setUploadInProgress] = useState(false);

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    try {
      setUploadInProgress(true);

      const formData = new FormData(event.target);

      const response = await fetch("/api/audio", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      router.push("/videos");
    } catch (error) {
      console.error(error);
    } finally {
      setUploadInProgress(false);
    }
  };

  return (
    <Layout>
      <div className="wrapper">
        <form onSubmit={handleFormSubmit}>
          {audio ? (
            <div>
              <p>Audio ready for upload</p>
              <audio src={URL.createObjectURL(audio)} controls></audio>
            </div>
          ) : (
            <div className="no-audio">
              <p className="danger">No audio file selected</p>
            </div>
          )}
          <div className="form-group file">
            <label htmlFor="audio">Click to select audio</label>
            <input
              type="file"
              id="audio"
              name="audio"
              multiple={false}
              hidden
              accept="audio/*"
              disabled={uploadInProgress}
              onInput={(event) => {
                setAudio(event.target.files[0]);
              }}
            />
          </div>

          <button
            className="button"
            type="submit"
            disabled={!audio || uploadInProgress}
          >
            Upload
          </button>
        </form>
      </div>
      <style jsx>{`
        div.wrapper {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        div.wrapper form {
          width: 60%;
          max-width: 600px;
          min-width: 300px;
          padding: 20px;
          border-radius: 5px;
          display: flex;
          flex-direction: column;
          justify-content: start;
          align-items: center;
          gap: 20px;
          background-color: #ffffff;
        }

        div.wrapper form div.form-group {
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flec-start;
        }

        div.wrapper form div.form-group.file {
          background-color: #f1f1f1;
          height: 150px;
          border-radius: 5px;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        div.wrapper form div.form-group label {
          font-weight: bold;
          height: 100%;
          width: 100%;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        div.wrapper form div.form-group.file input {
          height: 100%;
          width: 100%;
          cursor: pointer;
        }

        div.wrapper form button {
          width: 100%;
        }
      `}</style>
    </Layout>
  );
}

```

This is our home page. We first set up our router, we're going to need it to navigate to the videos page once we upload a video.

```js
const router = useRouter();
```

Read about the [Next.js router](https://nextjs.org/docs/api-reference/next/router).

We then define some simple states, one for the audio file

```js
const [audio, setAudio] = useState(null);
```

and the other to keep track of when upload is in progress

```js
const [uploadInProgress, setUploadInProgress] = useState(false);
```

The `useState` hook in React is responsible to defining and manipulating state inside a component. Read about it in the React [hooks docs](https://reactjs.org/docs/hooks-intro.html).

`handleFormSubmit` is triggered when the upload form is submitted. It is responsible for posting the form data to a `/api/audio` endpoint that we'll create later. 

```js
const response = await fetch("/api/audio", {
    method: "POST",
    body: formData,
});
```
When the response is successful, we navigate to the videos page using the next.js router

```js
router.push("/videos")
```

For the component body, we just have form with an input element that only accepts audio.

---

Create a new folder under `pages` and name it `videos`

```bash
mkdir pages/videos
```

Create two files under the new `pages/videos` folder, one named `index.js` and the other `[...id].js`

```bash
touch pages/videos/index.js && touch pages/videos/[...id].js
```

Paste the following code inside `pages/videos/index.js`

```jsx
import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import Layout from "../../components/Layout";

export default function VideosPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [videos, setVideos] = useState([]);

  const getVideos = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/videos", {
        method: "GET",
      });

      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      setVideos(data.result.resources);
    } catch (error) {
      // TODO: Show error message to user
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getVideos();
  }, [getVideos]);

  return (
    <Layout>
      <div className="wrapper">
        <div className="videos-wrapper">
          {videos.map((video, index) => {
            const splitVideoUrl = video.secure_url.split(".");

            splitVideoUrl[splitVideoUrl.length - 1] = "jpg";

            const thumbnail = splitVideoUrl.join(".");

            return (
              <div className="video-wrapper" key={`video-${index}`}>
                <div className="thumbnail">
                  <Image
                    src={thumbnail}
                    alt={video.secure_url}
                    layout="fill"
                  ></Image>
                </div>
                <div className="actions">
                  <Link
                    href="/videos/[...id]"
                    as={`/videos/${video.public_id}`}
                  >
                    <a>Open Video</a>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!isLoading && videos.length === 0 ? (
        <div className="no-videos">
          <b>No videos yet</b>
          <Link href="/" passHref>
            <button className="button">Upload Video</button>
          </Link>
        </div>
      ) : null}

      {isLoading ? (
        <div className="loading">
          <b>Loading...</b>
        </div>
      ) : null}

      <style jsx>{`
        div.wrapper {
          min-height: 100vh;
        }

        div.wrapper h1 {
          text-align: center;
        }

        div.wrapper div.videos-wrapper {
          padding: 20px;
          display: flex;
          flex-flow: row wrap;
          gap: 20px;
        }

        div.wrapper div.videos-wrapper div.video-wrapper {
          flex: 0 0 400px;
          height: 400px;
        }

        div.wrapper div.videos-wrapper div.video-wrapper div.thumbnail {
          position: relative;
          width: 100%;
          height: 80%;
        }

        div.loading,
        div.no-videos {
          height: 100vh;
          display: flex;
          flex-flow: column;
          justify-content: center;
          align-items: center;
          gap: 8px;
        }
      `}</style>
    </Layout>
  );
}

```

This is our videos page. We start off with some simple states.

```jsx
const [isLoading, setIsLoading] = useState(false);
const [videos, setVideos] = useState([]);
```

One is to keep track of the loading state and the other to store the videos.

Next we have a [memoized](https://en.wikipedia.org/wiki/Memoization) callback function called `getVideos`. This means that the callback will only change if one of it's dependencies changes instead of on every re-render. Read more about the `useCallback` hook in the React [docs](https://reactjs.org/docs/hooks-reference.html#usecallback). The function makes a GET request to the `/api/videos` endpoint to get all uploaded videos. We're going to be creating the endpoint later. 

The `useEffect` hook, just calls the `getVideos` function when the component render is committed to the screen. Read more about the `useEffect` hook in the [docs](https://reactjs.org/docs/hooks-reference.html#useeffect).

For the body, we just show the videos inside a flexbox. Opening a video will navigate to the video page that we're creating next.

---

Paste the following inside `pages/videos/[...id].js`.

```jsx
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import Layout from "../../components/Layout";

export default function VideoPage() {
  const router = useRouter();

  const id = Array.isArray(router.query.id)
    ? router.query.id.join("/")
    : router.query.id;

  const [isLoading, setIsLoading] = useState(false);
  const [video, setVideo] = useState(null);

  const getVideo = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/videos/${id}`, {
        method: "GET",
      });

      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      setVideo(data.result);
    } catch (error) {
      // TODO: Show error message to user
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    getVideo();
  }, [getVideo]);

  const handleDownload = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(video.secure_url, {});

      if (response.ok) {
        const blob = await response.blob();

        const fileUrl = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = fileUrl;
        a.download = `${video.public_id.replace("/", "-")}.${video.format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }

      throw await response.json();
    } catch (error) {
      // TODO: Show error message to user
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/videos/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      router.replace("/videos");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      {video && !isLoading ? (
        <div className="wrapper">
          <div className="video-wrapper">
            <video src={video.secure_url} controls></video>
            <div className="actions">
              <button
                className="button"
                onClick={handleDownload}
                disabled={isLoading}
              >
                Download
              </button>
              <button
                className="button danger"
                onClick={handleDelete}
                disabled={isLoading}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="loading">
          <b>Loading...</b>
        </div>
      ) : null}

      <style jsx>{`
        div.wrapper {
        }

        div.wrapper > div.video-wrapper {
          width: 80%;
          margin: 20px auto;
          display: flex;
          flex-flow: column;
          gap: 8px;
        }

        div.wrapper > div.video-wrapper > video {
          width: 100%;
        }

        div.wrapper > div.video-wrapper > div.actions {
          display: flex;
          flex-flow: row;
          gap: 8px;
        }

        div.loading {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>
    </Layout>
  );
}

```

This is very similar to the other pages. `getVideo` makes a GET call to a `/api/videos/:id` endpoint that we'll be creating later. `handleDownload` just downloads the video file. `handleDelete` makes a DELETE request to the `/api/videos/:id` endpoint to delete the video wih that [public ID](https://cloudinary.com/documentation/cloudinary_glossary#public_id).

---

Before we move on to the backend, we need to do one more thing. Since we're using the [Image component](https://nextjs.org/docs/api-reference/next/image) from Next.js, we need to add some configuration to `next.config.js`. To use and optimize images from external sites in our Image components, we need to add the domain names for those sites. In our case, we need to add that of cloudinary.

Add the following to `next.config.js` which should be at the root of your project.

```js
module.exports = {
  // ...other options
  images: {
    domains: ["res.cloudinary.com"],
  },
};
```

Read more about this [here](https://nextjs.org/docs/api-reference/next/image#domains).

---

Moving on to the backend. Create a new folder called `lib` at the root of your project. This folder will hold our shared code.

```bash
mkdir lib
```

Inside the `lib` folder create a file named `parse-form.js`

```bash
touch lib/parse-form.js
```

Paste the following code inside `lib/parse-form.js`

```js
import { IncomingForm, Files, Fields } from "formidable";

/**
 * Parses the incoming form data.
 *
 * @param {NextApiRequest} req The incoming request object
 * @returns {Promise<{fields:Fields;files:Files;}>} The parsed form data
 */
export const parseForm = (req) => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({ keepExtensions: true, multiples: true });

    form.parse(req, (error, fields, files) => {
      if (error) {
        return reject(error);
      }

      return resolve({ fields, files });
    });
  });
};

```

This is all the [formidable](https://www.npmjs.com/package/formidable) code we need to parse incoming form data. [Formidable](https://www.npmjs.com/package/formidable) is similar to [multer](https://www.npmjs.com/package/multer) in case you're wondering. Formidable has been around for the longest time and it's not Express.js specific, which is why we're using it.

---

Create a new file called `cloudinary.js` under `lib` folder.

```bash
touch lib/cloudinary.js
```

Paste the following code inside

```js
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
export const CLOUDINARY_FOLDER_NAME = "audio-waveform-videos/";

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
```

At the very top, we import the `v2` API from the cloudinary SDK. We also rename it to `cloudinary` for readability purposes.

```js
import { v2 as cloudinary, TransformationOptions } from "cloudinary";
```

Next, we initialize the SDK by calling the `.config` method and passing the `cloud_name`, `api_key` and `api_secret`. Remember that we defined `CLOUD_NAME`, `API_KEY` and `API_SECRET` much earlier in the [Cloudinary Account and Credentials](#cloudinary-account-and-credentials) section.

```js
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
```

Read more about [configuring the SDK](https://cloudinary.com/documentation/node_integration#setting_configuration_parameters_globally).

We also define a folder where we want all our videos to be uploaded to.

```js
const CLOUDINARY_FOLDER_NAME = "audio-waveform-videos/";
```

`getUploadedResource` takes in the [public ID](https://cloudinary.com/documentation/cloudinary_glossary#public_id) of a resource and calls the `api.resource` method to get the resource with that public ID. Read more about this in the [get a single resource docs](https://cloudinary.com/documentation/admin_api#get_the_details_of_a_single_resource).

`getUploadedResources` is similar to `getUploadedResource` but this one get all resource inside a folder instead of just a single resource. Read about the `api.resources` method in the [get resources docs](https://cloudinary.com/documentation/admin_api#get_resources).

Notice the use of [jsdoc](https://jsdoc.app/) to define a type without needing to use typescript.

```js
/**
 * @typedef {Object} Resource
 * @property {string | Buffer} file
 * @property {string} publicId
 * @property {boolean} inFolder
 * @property {string} folder
 * @property {TransformationOptions} transformation
 *
 */
```

I won't go into the specifics of [jsdoc](https://jsdoc.app/) but it's a nice feature to have.

`uploadResource` takes in an object of type **Resource**(the type that's defined using jsdoc above). It calls the `uploader.upload` method to upload a file to cloudinary. Read more about this in the [upload docs](https://cloudinary.com/documentation/image_upload_api_reference#upload).

`deleteResources` calls the `api.delete_resources` method on the SDK to delete resources using their public IDs. Read more about it [here](https://cloudinary.com/documentation/admin_api#delete_resources)

---

Create a new file called `audio.js` under `lib` folder

```js
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

```

`visualizeAudio` takes an audio object. It calls the `renderAudioVisualizer` function from [nodejs-audio-visualizer](https://www.npmjs.com/package/nodejs-audio-visualizer). This will take the audio file then create a visualization using the audio's form data. The resulting video will be stored to the `outputPath`. If you'd like to learn how to customize the visualization and what options you can pass, refer to the [docs](https://github.com/VladislavPetyukevich/audio-visualizer#example).

If the audio is a song, you may want to get the metadata so you can show the name of the song along with the artist and maybe even the album cover photo. `getMetadata` uses the `parseFile` function from the [music-metadata](https://www.npmjs.com/package/music-metadata) package. You can get some more information in the [docs](https://github.com/borewit/music-metadata#parsefile-function).

---

And now, we can finally move onto our API endpoints.

Create a new folder called `audio` under `pages/api`.

```bash
mkdir pages/api/audio
```

Create a new file called `index.js` under `pages/api/audio`

```bash
touch pages/api/audio/index.js
```

Paste the following code inside `pages/api/audio/index.js`

```js
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
```

This is where most of the magic happens. The file handles all HTTP requests made to the `/api/audio` endpoint. You can read more on Next.js API endpoints and their structure in the [API routes docs](https://nextjs.org/docs/api-routes/introduction). 

We first export a config object. Exported config objects in Next.js allow us to customize the API route. Read more about that [here](https://nextjs.org/docs/api-routes/api-middlewares#custom-config). In our case, we want to instruct Next.js not to use the default body parser since we're expecting form data instead of json.

```js
export const config = {
  api: {
    bodyParser: false,
  },
};
```

In our route handler, we use a switch statement so that we only accept POST requests and return a [status 405 - Method not allowed](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/405) for all other HTTP request methods.

`handlePostRequest` first parses the incoming form data using the `parseForm` function that we created earlier and then gets the audio from the parsed data.

```js
const data = await parseForm(req);

const audio = data.files.audio;
```

We then proceed to get the audio metadata

```js
const metadata = await getMetadata(audio.filepath);

const { title: songTitle, artist: songArtist } = metadata.common;
```

Just after that we generate a video of the audio waveform data using the `visualizeAudio` function that we created earlier

```js
const outputPath = await visualizeAudio({
    file: audio,
    outputPath: `repository/videos/${audio.originalFilename}.mp4`,
    visualizerBackgroundImage: "public/images/base-background.png",
    onProgress: (progress) => {
        console.log(`${progress}% done`);
    },
});
```

You can customize where you want to output the video by changing the value for `outputPath`. **Make sure the folder exists**. You can also change the background image of the waveform video by changing `visualizerBackgroundImage`. `onProgress` is called with the progress of the audio-video conversion. 

> Keep in mind that this process could take some time depending on the size of the audio file and the power of the computer running the code. Next.js with the default server is not the best for this, especially if it's going to be deployed in a serverless environment like Vercel. Consider using a custom server. In addition to this, I've included some recommendations at the end of this tutorial.

Once we have our video, we apply some transformations and upload it to Cloudinary. 

```js
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
```

[Cloudinary video transformations](https://cloudinary.com/documentation/video_manipulation_and_delivery) allow developers to manipulate videos during upload or even on the fly. For our video, we only want to apply a few transformations on upload. We want to display the name of the song and the name of the artist.

```js
transformation: [
    // The name of the song
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
    // Where to place the name of the ong
    {
        flags: "layer_apply",
        gravity: "north_west",
        x: "0.05",
        y: "0.06",
    },
    // The artist
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
    // Where to place the artist
    {
        flags: "layer_apply",
        gravity: "north_west",
        x: "0.05",
        y: "0.20",
    },
],
```

Have a look at this guide on [adding text overlays on videos](https://cloudinary.com/documentation/video_manipulation_and_delivery#adding_text_overlays). 

After the upload we delete the video from the file system to avoid using up too much space.

```js
await fs.unlink(outputPath);
```

---

Create a new folder called `videos` under `pages/api`. 

```bash
mkdir pages/api/videos
```

**This is not the same as `pages/videos`**

Create a file called `index.js` under `pages/api/videos`.

```bash
touch pages/api/videos/index.js
```

Paste the following inside `pages/api/videos/index.js`

```js
import { getUploadedResources } from "../../../lib/cloudinary";

/**
 *
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
 */
export default async function handler(req, res) {
  switch (req.method) {
    case "GET": {
      try {
        const result = await handleGetRequest();

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

const handleGetRequest = async () => {
  const uploads = await getUploadedResources();

  return uploads;
};

```

This file handles HTTP requests made to the `/api/videos` endpoint. `handleGetRequest` calls the `getUploadedResources` function that we created earlier to get all uploaded resources.

---

Create a new file called `[...id].js` under `pages/api/videos/`

```bash
touch pages/api/videos/[...id].js
```

Paste the following inside `pages/api/videos/[...id].js`.

```js
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
```

This file handles HTTP requests to the `/api/videos/:id` endpoint. The reason why we used the rest/spread syntax for the file name is because we want to match multiple dynamic routes. Naming it as `[id].js` would only match one dynamic route i.e. `/api/videos/:id`. We want to match all dynamic routes after `:id`, for example `/api/videos/:id`, `/api/videos/:id/someAction`, `/api/videos/:id/someAction/:otherId` e.t.c. Read all about this in the [Next.js docs](https://nextjs.org/docs/api-routes/dynamic-api-routes#catch-all-api-routes). 

`handleGetRequest` calls the `getUploadedResource` function that we created earlier to get a single resource using it's public id. We get the id from the request query. Similarly, `handleDeleteRequest` passes the public id to the `deleteResources` function that we created to delete a resource.

--- 

And with that we're done with the code. You can run the application.

```bash
npm run dev
```

## Recommendations

This is a simple project for demonstration purposes. If you must use Next.js for such a project, it's much better to use a [custom server](https://nextjs.org/docs/advanced-features/custom-server). In addition, the audio to video conversion and upload to cloudinary might take a very long time. Look into solutions such as [bull](https://optimalbits.github.io/bull/) for queues, [pusher](https://pusher.com/) for pub/sub and notifications, and [cloudinary notifications](https://cloudinary.com/documentation/notifications) for upload/transformation notifications.

You can queue audio-video conversion tasks then immediately return a success response and then subscribe to a notification on the client-side using pusher. Once the conversion is done, upload to cloudinary. Using, cloudinary notifications you will be notified when wth file is ready. Publish a notification using pusher from the backend. On the client with a subscription to the notification you will receive the notification that the upload is complete and ready. You can then do the appropriate action.

That's just one way of doing it. You can also look into [Server Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) and [Websockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

## The end

Congratulations! You made it to the end. You can find the full code on my [Github](https://github.com/newtonmunene99/audio-waveform-to-video)


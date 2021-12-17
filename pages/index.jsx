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

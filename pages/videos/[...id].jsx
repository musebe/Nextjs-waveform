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

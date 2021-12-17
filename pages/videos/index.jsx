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

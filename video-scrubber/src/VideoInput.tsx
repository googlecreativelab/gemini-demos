// Copyright 2024 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { useAtom } from "jotai";
import { videoSrcAtom, videoFileAtom, storedVideosAtom } from "./atoms";
import { useEffect } from "react";

export function VideoInput() {
  const [, setVideoSrc] = useAtom(videoSrcAtom);
  const [, setVideoFile] = useAtom(videoFileAtom);
  const [storedVideos, setStoredVideos] = useAtom(storedVideosAtom);

  useEffect(() => {
    // check for and remove any procsesed videos that have expired from localstore
    let toRemove: number[] = []
    if (storedVideos.length) {
      storedVideos.forEach((vid, i) => {
        if (new Date(vid.expirationTime) < new Date()) {
          toRemove.push(i)
        }
      })
    }
    if (toRemove.length) {
      const remaining = storedVideos.filter((_, index) => !toRemove.includes(index))
      setStoredVideos(remaining)
    }
  }, [storedVideos])

  return (
    <div>
      <input
        className="bg-neutral-700 p-4 pl-4 pr-8 mb-4"
        type="file"
        accept="video/*"
        onChange={(e) => {
          if (e.target.files) {
            const file = e.target.files[0];
            const src = URL.createObjectURL(file);
            console.log(src, file)
            setVideoFile(file)
            setVideoSrc(src);
          }
        }} />

      {storedVideos.length > 0 &&
        <>
          <h2 className="text-xl">Successfully processed videos:</h2>
          <p className="text-med text-gray-400">
            Please select again above to attempt reuse - videos are <a href="https://ai.google.dev/gemini-api/docs/prompting_with_media?lang=node" target="_blank">available for ~48 hours</a>
          </p>
          <ol className="list-disc p-4 pl-8">
            {storedVideos.map((vid) =>
              <li key={vid.uri}>
                <b>{vid.name}</b> modified on <i>{new Date(vid.lastModified).toDateString()}</i> <span>available until {new Date(vid.expirationTime).toDateString()}</span>
              </li>
            )}
          </ol>
        </>
      }
    </div >
  );
}


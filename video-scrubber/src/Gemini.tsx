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

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import {
  promptAtom,
  videoFileAtom,
  timestampTextAtom,
  storedVideosAtom,
  processedVideoAtom,
} from "./atoms";
import type { ProcessedVideo } from "./atoms"
import { FileMetadataResponse } from "@google/generative-ai/files";

const post = async (url: string, body: string | FormData) => {
  const opts: RequestInit = {
    method: "POST",
    body,
  };
  if (typeof body === "string") {
    opts.headers = {
      "Content-Type": "application/json",
    };
  }
  const f = await fetch(url, opts);
  return await f.json();
};

export function Gemini() {
  const [videoFile] = useAtom(videoFileAtom);
  const [prompt, setPrompt] = useAtom(promptAtom);
  const [, setTimestampText] = useAtom(timestampTextAtom);
  const [storedVideos, setStoredVideos] = useAtom(storedVideosAtom);
  const [processedVideo, setProcessedVideo] = useAtom(processedVideoAtom);

  useEffect(() => {
    // check stored videos to see if we already have one available
    const storedVideo = findVideoFromFile(videoFile!)
    if (storedVideo) {
      setProcessedVideo(storedVideo)
      setState(UploadState.Available)
    }
  }, [videoFile])

  const findVideoFromFile = (videoFile: File) => {
    console.log('findVideoFromFile:', videoFile)
    let foundVid = null;
    storedVideos.forEach((vid) => {
      if (vid.name === videoFile.name) {
        // name might stay same but other properties updated
        if (vid.lastModified === videoFile.lastModified && vid.size === videoFile.size) {
          foundVid = vid;
        }
      }
    })
    return foundVid;
  }

  const enum UploadState {
    Waiting = "",
    Uploading = "Uploading...",
    Processing = "Processing...",
    Processed = "Processed!",
    Failure = "Upload failed, please try again.",
    Available = "Found processed video - prompt away!"
  }
  // should probably be an atom...
  const [state, setState] = useState<UploadState>(UploadState.Waiting);

  const enum MODEL {
    Gemini = "gemini-1.5-pro-latest",
    Flash = "gemini-1.5-flash-latest"
  }
  const [model, setModel] = useState(MODEL.Gemini);

  const DEFAULT_PROMPT = 'Give me the 5 cutest moments in this cat video, with their timestamps'
  const CONCISE_PROMPT = "ONLY return the timestamps (in the format ##:##) and the descriptions, with no added commentary."
  const [useConcise, setUseConcise] = useState(true);
  const [sendingPrompt, setSendingPrompt] = useState(false);

  const promptable = (state: UploadState) => (state != UploadState.Processed && state != UploadState.Available) || sendingPrompt;

  const handleUploadClick = async () => {
    console.log("upload:", videoFile);
    try {
      if (videoFile) {
        setState((_) => UploadState.Uploading);
        const formData = new FormData();
        formData.set("video", videoFile);
        const resp = await post("/api/upload", formData);
        console.log("handleUploadClick::uploadResult()", resp.data);
        setState((_) => UploadState.Processing);
        checkProcessing(resp.data.name);
      }
    } catch (err) {
      console.error("Error Uploading Video", err);
    }
  };

  // combine info from chosen video file and the upload processing results
  const getVideoFromResult = (result: FileMetadataResponse): ProcessedVideo => {
    return {
      name: videoFile!.name,
      lastModified: videoFile!.lastModified,
      size: videoFile!.size,
      expirationTime: result.expirationTime,
      uri: result.uri,
      mimeType: result.mimeType
    }
  }

  const checkProcessing = async (name: string) => {
    setTimeout(async () => {
      const progressResult = await post(
        "/api/progress",
        JSON.stringify({ gemFileName: name }),
      );
      const state = progressResult.state;
      console.log("checkProcessing:", progressResult);
      if (state == "ACTIVE") {
        const processedVideo = getVideoFromResult(progressResult)
        setProcessedVideo(processedVideo)
        setStoredVideos([...storedVideos, processedVideo])
        setState((_) => UploadState.Processed);
      } else if (state == "FAILED") {
        setState((_) => UploadState.Failure);
      } else {
        setState((_) => UploadState.Processing);
        checkProcessing(progressResult.name);
      }
    }, 5000);
  };

  const handlePromptKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && event.metaKey) {
      sendPrompt();
    }
  };

  const sendPrompt = async () => {
    setSendingPrompt(true);

    let p = prompt;
    if (p.length == 0) { // empty
      p = DEFAULT_PROMPT
    }

    if (useConcise) {
      p += '\n' + CONCISE_PROMPT;
    }

    const response = await post(
      "/api/prompt",
      JSON.stringify({
        processedVideo,
        prompt: p,
        model
      }),
    );
    setSendingPrompt(false);
    const modelResponse = response.text;
    setTimestampText(modelResponse.trim());
  };

  const showConcise = () => {
    alert('Appends simple prompt for force response to only include timestamps and descriptions: "' +
      CONCISE_PROMPT + '"'
    )
  }

  return (
    <div className="mt-4">
      {state != UploadState.Available &&
        <>
          <button
            disabled={state == UploadState.Uploading || state == UploadState.Processing}
            className="bg-gray-500 enabled:hover:bg-gray-800 disabled:opacity-25 mr-4 font-bold py-2 px-4 rounded mb-4"
            onClick={handleUploadClick}
          >
            Upload to Gemini
          </button>
          <span>{state}</span>
        </>
      }
      <div className="flex mb-4">
        <div className="w-full relative mr-4">
          <textarea
            disabled={sendingPrompt}
            className="w-full h-24 bg-neutral-800 p-2 pr-32 focus:outline-none flex-auto mr-4"
            name="prompt"
            placeholder={DEFAULT_PROMPT}
            value={prompt}
            onKeyDown={handlePromptKeyDown}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            className="absolute top-2 right-2 bg-gray-500 enabled:hover:bg-gray-800 disabled:opacity-25 font-bold py-2 px-4 rounded"
            disabled={promptable(state)}
            onClick={sendPrompt}
          >Prompt!
          </button>
        </div>
        <div className="min-w-48">
          <div className="flex flex-col mb-4">
            <div className="flex">
              <input className="mr-4" type="radio" id="gemini" name="gemini" value={MODEL.Gemini} checked={model == MODEL.Gemini} onChange={() => { setModel(MODEL.Gemini) }} />
              <label htmlFor="gemini">Gemini 1.5 Pro</label>
            </div>
            <div className="flex">
              <input className="mr-4" type="radio" id="flash" name="flash" value={MODEL.Flash} checked={model == MODEL.Flash} onChange={() => { setModel(MODEL.Flash) }} />
              <label htmlFor="flash">Gemini Flash</label>
            </div>
          </div>
          <div className="flex items-center">
            <input type="checkbox" className="mr-2 h-10" checked={useConcise} onChange={() => setUseConcise(!useConcise)} />
            <span>Auto-format</span>
            <span className="google-symbols ml-2 cursor-pointer" onClick={showConcise}>help</span>
          </div>
        </div>
      </div>
    </div>
  );
}

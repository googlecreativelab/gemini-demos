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

import { atomWithStorage, } from "jotai/utils"
import { atom } from "jotai";
import { AsyncStorage } from "jotai/vanilla/utils/atomWithStorage";

export const videoFileAtom = atom<File | null>(null);
export const videoSrcAtom = atom<string | null>(null);
export const videoElAtom = atom<HTMLVideoElement | null>(null);
export const isPlayingAtom = atom<boolean>(false);
export const playPositionAtom = atom<number>(0);
export const videoLengthAtom = atom<number>(0);
export const timestampTextAtom = atom("");
export const timestampDefaultDurationAtom = atom<number>(1.5);
export const padStartAtom = atom<number>(0.2);
export const timelineScrollRefAtom = atom<{ current: HTMLDivElement | null }>({
  current: null,
});
export const timeoutRefAtom = atom<{ current: number }>({ current: 0 });
export const isPlayingAllAtom = atom<boolean>(false);
export const promptAtom = atom<string>("");

// Type and custom storage for use with our localStorage video store,
// which is shared by Gemini and VideoInput
export type ProcessedVideo = {
  name: string,
  lastModified: number,
  size: number
  uri: string,
  expirationTime: string,
  mimeType: string,
}

const videoStorage: AsyncStorage<ProcessedVideo[]> = {
  getItem(key, _) {
    const item = localStorage.getItem(key)
    if (item) {
      return JSON.parse(item)
    } else {
      return []
    }
  },
  setItem(key, val) {
    return new Promise<void>((res, rej) => {
      try {
        localStorage.setItem(key, JSON.stringify(val))
        res();
      } catch (error) {
        rej(error);
      }
    })
  },
  removeItem(key) {
    return new Promise<void>((res, rej) => {
      try {
        localStorage.removeItem(key);
        res();
      } catch (error) {
        rej(error);
      }
    })
  },
}
export const storedVideosAtom = atomWithStorage('processedVideos', [], videoStorage)
export const processedVideoAtom = atom<ProcessedVideo | null>(null)
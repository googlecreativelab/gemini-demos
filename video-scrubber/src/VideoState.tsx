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
import {
  isPlayingAtom, playPositionAtom,
  timelineScrollRefAtom, videoElAtom,
  videoLengthAtom
} from "./atoms";
import { useEffect } from "react";
import { secondWidth } from "./consts";

export function VideoState() {
  const [videoEl] = useAtom(videoElAtom);
  const [, setIsPlaying] = useAtom(isPlayingAtom);
  const [, setPlayPosition] = useAtom(playPositionAtom);
  const [videoLength, setVideoLength] = useAtom(videoLengthAtom);
  const [timelineScrollRef] = useAtom(timelineScrollRefAtom);

  const player = videoEl!;

  const timelineWidth = videoLength * secondWidth;

  useEffect(() => {
    function updateIsPlaying() {
      setIsPlaying(!player.paused);
    }
    function updatePlayPosition() {
      // Update this here so we don't get weird jumps
      if (timelineScrollRef.current) {
        const scrollEl = timelineScrollRef.current;
        const playPositionLeft = (player.currentTime / player.duration) * timelineWidth;
        if (playPositionLeft < scrollEl.scrollLeft) {
          scrollEl.scrollLeft = playPositionLeft - 64;
        } else if (playPositionLeft + 64 >
          scrollEl.scrollLeft + scrollEl.clientWidth) {
          scrollEl.scrollLeft = playPositionLeft - 64;
        }
      }
      setPlayPosition(Math.round(player.currentTime * 20) / 20);

    }
    function updateVideoLength() {
      setVideoLength(player.duration);
    }
    player.addEventListener("play", updateIsPlaying);
    player.addEventListener("pause", updateIsPlaying);
    player.addEventListener("ended", updateIsPlaying);
    player.addEventListener("timeupdate", updatePlayPosition);
    player.addEventListener("loadedmetadata", updateVideoLength);
    return () => {
      player.removeEventListener("play", updateIsPlaying);
      player.removeEventListener("pause", updateIsPlaying);
      player.removeEventListener("ended", updateIsPlaying);
      player.removeEventListener("timeupdate", updatePlayPosition);
      player.removeEventListener("loadedmetadata", updateVideoLength);
    };
  }, [player, timelineScrollRef, videoLength]);

  return null;
}


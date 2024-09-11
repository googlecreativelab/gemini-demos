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

import { useAtom, useSetAtom } from "jotai";
import {
  playPositionAtom, videoElAtom,
  videoLengthAtom
} from "./atoms";
import { secondsToTimestamp } from "./utils";
import { useDrag } from "@use-gesture/react";
import { secondWidth } from "./consts";


export function PlayTimeline() {
  const [videoEl] = useAtom(videoElAtom);
  const setPlayPosition = useSetAtom(playPositionAtom);
  const [playPosition] = useAtom(playPositionAtom);
  const [videoLength] = useAtom(videoLengthAtom);
  const player = videoEl!;

  const timelineDrag = useDrag(({ active, xy: [x], currentTarget }) => {
    if (active) {
      const el = currentTarget as HTMLElement;
      const offset = el.getBoundingClientRect().left;
      const newPosition = ((x - offset) / el.clientWidth) * player.duration;
      setPlayPosition(newPosition);
      player.currentTime = newPosition;
    }
  });

  const timelineWidth = videoLength * secondWidth;

  return (
    <div
      className="bg-neutral-400 h-0 relative flex justify-end touch-none cursor-crosshair"
      {...timelineDrag()}
      style={{
        width: timelineWidth,
      }}
    >
      <div
        className="absolute bg-neutral-800 h-6 pointer-events-none"
        style={{
          width: 2,
          top: 0,
          marginLeft: -1,
          left: `${(playPosition / player.duration) * 100}%`,
        }}
      ></div>
      <div className="fixed right-0 -mt-[26px] flex text-sm items-center text-neutral-400 font-mono pointer-events-none select-none px-2">
        <div>{secondsToTimestamp(Math.round(playPosition))}</div> /{" "}
        <div>{secondsToTimestamp(Math.round(videoLength))}</div>
      </div>
    </div>
  );
}


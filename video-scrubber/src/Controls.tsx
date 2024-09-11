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
  isPlayingAllAtom,
  isPlayingAtom,
  padStartAtom,
  playPositionAtom,
  timeoutRefAtom,
  timestampDefaultDurationAtom,
  timestampTextAtom,
  videoElAtom,
} from "./atoms";
import { parseTimestamps, timestampToSeconds } from "./utils";

export function Controls() {
  const [videoEl] = useAtom(videoElAtom);
  const [isPlaying] = useAtom(isPlayingAtom);
  const [timestampDefaultDuration, setTimestampDefaultDuration] = useAtom(
    timestampDefaultDurationAtom,
  );
  const [padStart, setPadStart] = useAtom(padStartAtom);
  const [timestampText] = useAtom(timestampTextAtom);
  const [timeoutRef] = useAtom(timeoutRefAtom);
  const setPlayPosition = useSetAtom(playPositionAtom);
  const [isPlayingAll, setIsPlayingAll] = useAtom(isPlayingAllAtom);
  const [defaultDuration] = useAtom(timestampDefaultDurationAtom);

  const timestamps = parseTimestamps(timestampText);
  const timestampSeconds = timestamps.map((tobject) => {
    return {
      start: timestampToSeconds(tobject.start),
      end: tobject.end
        ? timestampToSeconds(tobject.end)
        : timestampToSeconds(tobject.start) + defaultDuration,
      annotation: tobject.annotation,
    };
  });

  const player = videoEl!;

  return (
    <div className="flex justify-between select-none">
      <div className="flex gap-px">
        {isPlaying ? (
          <button
            className="px-2 w-16 bg-neutral-600 hover:bg-neutral-700 py-1"
            onClick={() => player.pause()}
          >
            Pause
          </button>
        ) : (
          <button
            className="px-2 w-16 py-1 bg-neutral-600 hover:bg-neutral-700"
            onClick={() => player.play()}
          >
            Play
          </button>
        )}
        <button
          className="px-2 py-1 bg-neutral-600 hover:bg-neutral-700"
          onClick={() => {
            player.currentTime = 0;
          }}
        >
          Reset
        </button>
        {isPlayingAll ? (
          <button
            className="px-2 py-1 bg-neutral-600 hover:bg-neutral-700"
            onClick={() => {
              setIsPlayingAll(false);
              if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
              }
              player.pause();
            }}
          >
            Stop all timestamps
          </button>
        ) : (
          <button
            className="px-2 py-1 bg-neutral-600 hover:bg-neutral-700"
            onClick={() => {
              setIsPlayingAll(true);
              function getNextTimestamp() {
                for (const range of timestampSeconds) {
                  const { start, end } = range;
                  if (start > player.currentTime) {
                    return [start, end];
                  }
                }
                return undefined;
              }
              function playTimestamps() {
                const nextTimestamp = getNextTimestamp();
                if (nextTimestamp !== undefined) {
                  const [nextStart] = nextTimestamp;
                  const nextEnd =
                    nextTimestamp[1] ?? nextStart + timestampDefaultDuration;
                  setPlayPosition(nextStart - padStart);
                  player.currentTime = nextStart - padStart;
                  player.play();
                  timeoutRef.current = window.setTimeout(
                    () => {
                      playTimestamps();
                    },
                    (nextEnd - nextStart + padStart) * 1000,
                  );
                } else {
                  player.pause();
                  setIsPlayingAll(false);
                }
              }
              playTimestamps();
            }}
          >
            Play all timestamps
          </button>
        )}
      </div>
      <div className="flex gap-1">
        <div className="px-1 py-1 flex items-center gap-1">
          <div className="text-sm text-neutral-300">pad clip start:</div>
          <input
            type="number"
            step="0.1"
            className="w-14 px-1 bg-neutral-300 text-black text-sm"
            value={padStart}
            onChange={(e) => {
              const value = Number(e.target.value);
              setPadStart(value);
            }}
          />
        </div>
        <div className="px-1 py-1 flex items-center gap-1">
          <div className="text-sm text-neutral-300">default clip duration:</div>
          <input
            type="number"
            step="0.1"
            className="w-14 px-1 bg-neutral-300 text-black text-sm"
            value={timestampDefaultDuration}
            onChange={(e) => {
              const value = Number(e.target.value);
              setTimestampDefaultDuration(value);
            }}
          />
        </div>
      </div>
    </div>
  );
}

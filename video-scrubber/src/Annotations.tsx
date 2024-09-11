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
import { playPositionAtom, timestampDefaultDurationAtom, timestampTextAtom } from "./atoms";
import { parseTimestamps, timestampToSeconds } from "./utils";

export function Annotations() {
  const [timestampText] = useAtom(timestampTextAtom);
  const [playPosition] = useAtom(playPositionAtom);
  const [defaultDuration] = useAtom(timestampDefaultDurationAtom);

  const timestamps = parseTimestamps(timestampText);
  const timestampSeconds = timestamps.map((tobject) => {
    return {
      start: timestampToSeconds(tobject.start),
      end: tobject.end ? timestampToSeconds(tobject.end) : timestampToSeconds(tobject.start) + defaultDuration,
      annotation: tobject.annotation
    };
  });

  const activeAnnotation = timestampSeconds.find((range) => {
    return playPosition >= range.start && playPosition <= range.end;
  })?.annotation;

  return <div className="relative">
    <div className="absolute bottom-0 left-0 w-full h-16 text-white text-center">
      {activeAnnotation ? <span className="text-lg bg-neutral-800 bg-opacity-80 px-1">{activeAnnotation}</span> : null}
    </div>
  </div>;
}

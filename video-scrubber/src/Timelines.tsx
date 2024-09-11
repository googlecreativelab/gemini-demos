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
import { timelineScrollRefAtom } from "./atoms";
import { ClipTimeline } from "./ClipTimeline";

export function Timelines() {
  const [timelineScrollRef] = useAtom(timelineScrollRefAtom);
  return (
    <div
      ref={(el) => {
        timelineScrollRef.current = el;
      }}
      className="overflow-x-auto mt-px pb-4"
    >
      <ClipTimeline />
    </div>
  );
}


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
import { timestampTextAtom } from "./atoms";

export function TimestampText() {
  const [timestampText, setTimestampText] = useAtom(timestampTextAtom);
  return (
    <textarea
      className="w-full h-48 bg-neutral-800 p-2 focus:outline-none"
      placeholder="Or paste your timestamps here from anywhere"
      onChange={(e) => {
        const text = e.target.value;
        setTimestampText(text);
      }}
      value={timestampText}
    >
    </textarea>
  );
}


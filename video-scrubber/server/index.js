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

import express from "express";
import ViteExpress from "vite-express";
import multer from "multer";
import { checkProgress, promptVideo, uploadVideo } from "./gemini.js";

const app = express();
app.use(express.json());

// need /tmp for appengine and gemini api to access
const upload = multer({ dest: "/tmp/" })
app.post("/api/upload", upload.single('video'), async (req, res) => {

  try {
    const file = req.file;
    const resp = await uploadVideo(file)
    console.log(resp);
    res.json({ data: resp });

  } catch (error) {
    res.status(500).json({ error })
  }
})

app.post("/api/progress", async (req, res) => {
  try {
    console.log('/api/progress request', req.body)
    const gemFileName = req.body.gemFileName
    const progress = await checkProgress(gemFileName)
    console.log('/api/progress', progress)
    res.json(progress)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error })
  }
})

app.post("/api/prompt", async (req, res) => {
  try {
    const reqData = req.body
    console.log('/api/prompt', reqData)
    const videoResponse = await promptVideo(reqData.processedVideo, reqData.prompt, reqData.model)
    res.json(videoResponse)
  } catch (error) {
    res.json({ error }, { status: 400 })
  }
})

// eslint-disable-next-line no-undef
const port = process.env.NODE_ENV === "production" ? 8080 : 3000;

ViteExpress.listen(app, port, () => console.log("Server is listening..."));

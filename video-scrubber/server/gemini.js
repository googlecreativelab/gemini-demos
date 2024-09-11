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

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/files";

const KEY = process.env["GEMINI_API_KEY"];
const fileManager = new GoogleAIFileManager(KEY);
const genAI = new GoogleGenerativeAI(KEY);

export const uploadVideo = async (file) => {
    // TODO check if it exists already ... how?
    try {
        const uploadResult = await fileManager.uploadFile(file.path, {
            displayName: file.originalname,
            mimeType: file.mimetype,
        })
        console.log(`uploadComplete: ${uploadResult.file}`)
        return uploadResult.file
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const checkProgress = async (name) => {
    try {
        const result = await fileManager.getFile(name);
        return result;
    } catch (error) {
        console.error(error);
        return { error };
    }
}

export const promptVideo = async (processedVideo, prompt, model) => {
    try {
        const req = [
            { text: prompt },
            {
                fileData: {
                    mimeType: processedVideo.mimeType,
                    fileUri: processedVideo.uri
                }
            },
        ];
        console.log(`promptVideo with ${model}`, req)
        const result = await genAI.getGenerativeModel({ model }).generateContent(req);
        console.log(`promptVideo response`, result.response.text())
        return {
            text: result.response.text(),
            candidates: result.response.candidates,
            feedback: result.response.promptFeedback
        }
    } catch (error) {
        console.error(error)
        return { error }
    }
}
/**
Copyright 2024 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blueAccent: {
          DEFAULT: "#293EFF",
        },
        purpleAccent: {
          DEFAULT: "#9FA9FF",
        },
        gBlack: {
          600: "#6F6C72",
          800: "#1E1F20",
          900: "#000000",
        },
        gWhite: {
          100: "#ffffff",
          200: "#E4E3E3",
          400: "#A7A7A7",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

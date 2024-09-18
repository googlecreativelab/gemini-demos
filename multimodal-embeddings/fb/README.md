# Firebase Function for Embedding

This Function was responsible for watching our Firebase storage bucket and sending any images uploaded to the Gemini Multimodal Embeddings API, storing those embeddings in a Vector in our Firestore database. Read more about Cloud Functions [here](https://firebase.google.com/docs/functions).

For more information on how Firebase handles embeddings, check out [Search with Vector Search](https://firebase.google.com/docs/firestore/vector-search) in the Firebase docs, which this code is based on.

`functions/src/index.ts` has lots of comments in it so you can follow along, though in order to keep our sanity and have the embedding code in one place, it imports `embedder.ts` from the main `/src/lib` directory.

Make sure to update the `.firebaserc` file with your project name, or just use `firebase init` from the cli to create a new project to deploy to.

Like any other Node project, make sure to run `npm i` before testing anything, like local emulation with `npm run serve`

### Gemini Labeling

There's also some code in `functions/src/gemini.ts` that attempted to add labels to our embeddings, sending each image to Gemini and getting back a description. Useful for learning about the multimodal capabilities of Gemini, but was ultimately not necessary for our experiments.

It requires the same API key you generated for the main project.

> It's worth noting: The MM Embedding API can take in text, image, and video, but it doesn't _automatically_ combine them in any meaningful way. You can, of course, add those vectors together yourself after the fact, to give you a new vector of those combined objects.

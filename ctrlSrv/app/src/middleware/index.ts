import { mapBackgroundImage, mapMaxPosition } from "$src/store/map-background-image.store";
import type { LoadInput, LoadOutput } from "@sveltejs/kit";
import getContext from "./context";

export type Middleware = (input: LoadInput) => Promise<LoadOutput>;

const middlewares = new Map<string, Middleware>();

/**
 * Middlewares
 * 
 * This mapping is using the key to match with the route path.
 * 
 * How add a a new one:
 * 
 * middlewares.set(<path>, (input) => {
 *    // next and redirect are helpers to use in your middleware
 *    const { next, redirect } = getContext(input);
 *  
 *    if(!false) redirect("/another-route")
 * 
 *    return success(); // Continue with 200 status
 * })
 * 
 */

middlewares.set("/", input => {
  const { success, redirect } = getContext(input);

  const mapSize = mapMaxPosition.getValue();
  const backgroundImage = mapBackgroundImage.getValue();

  if (!mapSize || !backgroundImage) {
    return redirect('/upload-map')
  }

  return success()
});


export function checkMiddlewares(input: LoadInput): Promise<LoadOutput> {
  const middleware = middlewares.get(input.page.path);

  if (middleware) return middleware(input);

  return Promise.resolve({ status: 200 });
}

export default checkMiddlewares;
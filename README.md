# ViteKit

## Getting Started

```bash
npx create-vitekit@latest my-app --template fastify
cd my-app
npm i
npm run dev

# Or build for production
# Server will be built into ./build/server.js
# You should add ./build to .gitignore
npm run build
```

## Guide

### Configuration

ViteKit provides a Vite plugin you can add to an existing Vite project, when using `create-vitekit` the generated project will have everything configured, this will be how your `vite.config.ts` looks like:

```ts
import { defineConfig } from "vite"
import vitekit from "vitekit/plugin"

export default defineConfig({
  plugins: [vitekit()],
})
```

### Adapters

ViteKit is built for the Edge, it includes support for Node.js server, Vercel, Cloudflare Workers and other platforms via adapters.

These adapters are available as npm packages:

- `@vitekit/adapter-node`
- `@vitekit/adapter-vercel`
- `@vitekit/adapter-cloudflare-workers`

Just install one of them using `npm` in your project and ViteKit will automatically picks it up, if multiple are installed ViteKit will complain about it.

### Routes

ViteKit does nothing by default, your app will continue functioning as a normal Vite app, until you create your first route in `./routes` directory:

```ts
// routes/hello.ts
import { LoaderFunction } from "vitekit/server"

export const loader: LoaderFunction = () => {
  return new Response("hello world")
}
```

Trying visiting `/hello` and you'll see exactly what you expect: `hello world`.

This `loader` function is responsible for handling `GET` requests to `/hello` and returning a `Response` object, if a `null` value is returned, it will fallback to render your regular Vite app.

If you want to handle `POST`, `DELETE` and other methods, you should use `action` function instead:

```ts
import { ActionFunction } from "vitekit/server"

export const action: ActionFunction = async ({ request }) => {
  const data = await request.json()
  return {
    body: {
      data,
    },
  }
}
```

You see, you can also return an object in the shape of `{ body, status, headers }` instead of a `Response` object, this will be converted to a `Response` object automatically.

Besides that, both `loader` and `action` accept an argument which has following properties:

- `request`: the `Request` object
- `params`: the route `params` object, see dynamic routing for more details.

### Dynamic Routing

So far the routes are static, you can use dynamic routing to handle multiple routes at once, let's add the following route:

```
routes/posts/$id.ts
```

```ts
import { LoaderFunction } from "vitekit/server"

export const loader: LoaderFunction = async ({ params }) => {
  return new Response(`received post id: ${params.id}`)
}
```

Multiple dynamic parameters also work, for example:

```
routes/users/$user/posts/$post.ts
```

### Catch All Routes

Let's create a route like this:

```
routes/posts/$.ts
```

```ts
import { LoaderFunction } from "vitekit/server"

export const loader: LoaderFunction = async ({ params }) => {
  return new Response(params.wild)
}
```

Now if you visit `/posts/foo` and `/posts/foo/bar` you will see `foo` and `foo/bar`.

## License

MIT &copy; [EGOIST](https://github.com/sponsors/egoist)

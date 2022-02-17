import html from "vitekit/html"

export default () => {
  return html`<html>
    <head>
      ${html.head}
    </head>
    <body>
      ${html.main} ${html.scripts}
    </body>
  </html> `
}

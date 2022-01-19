import { htmlEscape } from "escape-goat"

type PlaceholderType = "scripts" | "main" | "head"

class Placeholder {
  constructor(public type: PlaceholderType) {}

  toComment() {
    return `<!--vitekit-placeholder:${this.type}-->`
  }
}

export const replacePlaceholders = (
  html: string,
  replacements: {
    [type in PlaceholderType]: string
  }
) => {
  for (const type of Object.keys(replacements)) {
    html = html.replace(
      `<!--vitekit-placeholder:${type}-->`,
      // @ts-expect-error
      replacements[type]
    )
  }
  return html
}

export default function html(
  literals: TemplateStringsArray,
  ...substs: (string | Placeholder)[]
): string {
  return literals.raw.reduce((acc, lit, i) => {
    let subst = substs[i - 1]

    if (Array.isArray(subst)) {
      throw new Error(`Expected string but got array in the substitution.`)
    }

    if (subst instanceof Placeholder) {
      subst = subst.toComment()
    } else if (literals.raw[i - 1] && literals.raw[i - 1].endsWith("$")) {
      // If the interpolation is preceded by a dollar sign,
      // substitution is considered safe and will not be escaped
      acc = acc.slice(0, -1)
    } else {
      subst = htmlEscape(subst)
    }

    return acc + subst + lit
  })
}

html.head = new Placeholder("head")
html.main = new Placeholder("main")
html.scripts = new Placeholder("scripts")

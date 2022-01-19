// Modified from https://github.com/lukeed/route-sort/blob/master/src/index.js

function toValue(str: string) {
  if (str == "*") return 1e11 // wild
  if (/^\:(.*)\?/.test(str)) return 1111 // param optional
  if (/^\:(.*)\./.test(str)) return 11 // param w/ suffix
  if (/^\:/.test(str)) return 111 // param
  return 1 // static
}

function toRank(str: string) {
  var i = 0,
    out = "",
    arr = str.split("/")
  for (; i < arr.length; i++) out += toValue(arr[i])
  return (i - 1) / +out
}

export function sortRoutesInPlace<T extends { path: string }>(
  arr: T[],
  cache: Record<string, number> = {}
) {
  return arr.sort(function (a, b) {
    return (
      (cache[b.path] = cache[b.path] || toRank(b.path)) -
      (cache[a.path] = cache[a.path] || toRank(a.path))
    )
  })
}

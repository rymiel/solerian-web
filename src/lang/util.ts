export type GSubMap = readonly (readonly [string | RegExp, string])[];
export function gsub(str: string, map: GSubMap): string {
  map.forEach(([k, v]) => {
    str = str.replaceAll(k, v);
  });
  return str;
}

const BACKREFERENCE = /\\(\d)/g;
export function gsubBackreference(str: string, map: GSubMap): string {
  map.forEach(([k, v]) => {
    str = str.replaceAll(k, (_, ...groups) => {
      return v.replace(BACKREFERENCE, (_, g) => {
        return groups[parseInt(g) - 1];
      });
    });
  });
  return str;
}

export type SubMap = readonly (readonly [string, string])[];
export function sub(str: string, map: SubMap): string {
  const [rk, ri, rv] = map
    .map(([k, v]) => [k, str.indexOf(k), v] as const)
    .filter(([_k, i, _v]) => i !== -1)
    .reduce(([k0, i0, v0], [k1, i1, v1]) => (i0 <= i1 ? [k0, i0, v0] : [k1, i1, v1]), ["", Infinity, ""]);

  if (ri === Infinity) return str;
  return str.replace(rk, rv);
}

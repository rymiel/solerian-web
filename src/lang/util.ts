export type SubMap = readonly (readonly [string | RegExp, string])[];
export function gsub(str: string, map: SubMap): string {
  map.forEach(([k, v]) => {
    str = str.replaceAll(k, v);
  });
  return str;
}

const BACKREFERENCE = /\\(\d)/g;
export function gsubBackreference(str: string, map: SubMap): string {
  map.forEach(([k, v]) => {
    str = str.replaceAll(k, (_, ...groups) => {
    //   console.log(str, k, groups);
      return v.replace(BACKREFERENCE, (_, g) => {
        // console.log(str, k, groups, m, g, parseInt(g), groups[parseInt(g) - 1]);
        return groups[parseInt(g) - 1];
      });
    });
  });
  return str;
}

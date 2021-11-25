export const objectArrayToMap = <T extends { [key: string]: any }>(arr: T[], key: string) =>
  arr.reduce((acc, curr: T) => {
    acc[curr[key] as string] = curr;
    return acc;
  }, {} as { [key: string]: T });

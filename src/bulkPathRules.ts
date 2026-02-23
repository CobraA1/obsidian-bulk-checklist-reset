export function normalizeVaultPath(path: string): string {
  let normalizedPath = path.trim().replaceAll("\\", "/");
  normalizedPath = normalizedPath.replace(/^(\.\/)+/, "");
  normalizedPath = normalizedPath.replace(/^\/+/, "");
  normalizedPath = normalizedPath.replace(/\/+$/, "");
  return normalizedPath;
}

export function parseRules(multiline: string): string[] {
  return multiline
    .split(/\r?\n/)
    .map((rule) => normalizeVaultPath(rule))
    .filter((rule) => rule !== "");
}

export function matchesRule(filePath: string, rule: string): boolean {
  const normalizedFilePath = normalizeVaultPath(filePath);
  const normalizedRule = normalizeVaultPath(rule);

  if (!normalizedFilePath || !normalizedRule) {
    return false;
  }

  return (
    normalizedFilePath === normalizedRule ||
    normalizedFilePath.startsWith(`${normalizedRule}/`)
  );
}

export function isIncluded(
  filePath: string,
  includes: string[],
  excludes: string[]
): boolean {
  if (includes.length === 0) {
    return false;
  }

  const includeMatch = includes.some((rule) => matchesRule(filePath, rule));
  if (!includeMatch) {
    return false;
  }

  const excludeMatch = excludes.some((rule) => matchesRule(filePath, rule));
  return !excludeMatch;
}

import { normalizeVaultPath, parseRules } from "./bulkPathRules";

function stringifyRules(rules: string[]): string {
  return rules.join("\n");
}

export function hasPathRule(multiline: string, path: string): boolean {
  const normalizedPath = normalizeVaultPath(path);
  return parseRules(multiline).includes(normalizedPath);
}

export function addPathRule(multiline: string, path: string): string {
  const normalizedPath = normalizeVaultPath(path);
  if (!normalizedPath) {
    return multiline;
  }

  const rules = parseRules(multiline);
  if (rules.includes(normalizedPath)) {
    return multiline;
  }

  return stringifyRules([...rules, normalizedPath]);
}

export function removePathRule(multiline: string, path: string): string {
  const normalizedPath = normalizeVaultPath(path);
  if (!normalizedPath) {
    return multiline;
  }

  const rules = parseRules(multiline).filter((rule) => rule !== normalizedPath);
  return stringifyRules(rules);
}

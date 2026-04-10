export function normalizePath(value: string): string {
  return value.replace(/\\/g, "/");
}

export function buildWorkspaceRelativePath(
  relativePath: string,
  fallbackName: string,
  workspaceFolderName?: string,
  includeWorkspaceFolderName = false,
): string {
  const normalizedRelativePath = relativePath || fallbackName;

  if (!includeWorkspaceFolderName || !workspaceFolderName) {
    return normalizedRelativePath;
  }

  return `${normalizePath(workspaceFolderName)}/${normalizedRelativePath}`;
}

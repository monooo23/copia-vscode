import * as vscode from "vscode";

export function extractResourceUris(primary?: unknown, secondary?: unknown): vscode.Uri[] {
  const items = flattenResourceUris(primary).concat(flattenResourceUris(secondary));
  const seen = new Set<string>();
  const unique: vscode.Uri[] = [];

  for (const uri of items) {
    const key = uri.toString();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(uri);
  }

  return unique;
}

function flattenResourceUris(value: unknown): vscode.Uri[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => flattenResourceUris(item));
  }

  if (value instanceof vscode.Uri) {
    return [value];
  }

  if (typeof value === "object") {
    const resource = value as Record<string, unknown>;

    if (resource["resourceUri"] instanceof vscode.Uri) {
      return [resource["resourceUri"]];
    }

    if (resource["sourceUri"] instanceof vscode.Uri) {
      return [resource["sourceUri"]];
    }

    if (resource["uri"] instanceof vscode.Uri) {
      return [resource["uri"]];
    }

    if (resource["original"]) {
      return flattenResourceUris(resource["original"]);
    }

    if (Array.isArray(resource["resourceStates"])) {
      return resource["resourceStates"].flatMap((item: unknown) => flattenResourceUris(item));
    }
  }

  return [];
}

export interface SymbolTreeNode<TKind = unknown> {
  readonly kind: TKind;
  readonly range: { contains(position: unknown): boolean };
  readonly children?: readonly SymbolTreeNode<TKind>[];
}

export function findEnclosingSymbol<T extends SymbolTreeNode<TKind>, TKind>(
  symbols: readonly T[],
  position: unknown,
  preferredKinds: ReadonlySet<TKind>,
): T | undefined {
  const containing: T[] = [];
  collect(symbols, position, containing);

  if (containing.length === 0) {
    return undefined;
  }

  for (let i = containing.length - 1; i >= 0; i--) {
    if (preferredKinds.has(containing[i]!.kind)) {
      return containing[i];
    }
  }

  return containing[containing.length - 1];
}

function collect<T extends SymbolTreeNode<TKind>, TKind>(
  symbols: readonly T[],
  position: unknown,
  out: T[],
): void {
  for (const sym of symbols) {
    if (!sym.range.contains(position)) {
      continue;
    }

    out.push(sym);
    if (sym.children?.length) {
      collect(sym.children as readonly T[], position, out);
    }
  }
}

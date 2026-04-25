export interface StagedItem {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly detail?: string;
  readonly content: string;
}

export type IdGenerator = () => string;

const defaultIdGenerator: IdGenerator = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export class StageStore {
  private items: StagedItem[] = [];

  constructor(private readonly idGenerator: IdGenerator = defaultIdGenerator) {}

  public add(item: Omit<StagedItem, "id">): StagedItem {
    const staged: StagedItem = { id: this.idGenerator(), ...item };
    this.items.push(staged);
    return staged;
  }

  public remove(id: string): boolean {
    const before = this.items.length;
    this.items = this.items.filter((existing) => existing.id !== id);
    return this.items.length !== before;
  }

  public clear(): boolean {
    if (this.items.length === 0) {
      return false;
    }
    this.items = [];
    return true;
  }

  public list(): readonly StagedItem[] {
    return this.items;
  }

  public bundle(): string {
    return this.items.map((item) => item.content).join("\n\n");
  }

  public count(): number {
    return this.items.length;
  }
}

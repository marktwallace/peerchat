import Dexie from "dexie";

const DATABASE_NAME = "ChatAppDB";

class LocalStorageDatabase extends Dexie {
  public keyPairs: Dexie.Table<{ id: string; publicKey: string; privateKey: string }, string>;
  public invites: Dexie.Table<{ id: string; token: string; acceptedAt: Date }, string>;

  constructor() {
    super(DATABASE_NAME);
    this.version(1).stores({
      keyPairs: "id", // id = "current"
      invites: "id", // id = invite token
    });

    this.keyPairs = this.table("keyPairs");
    this.invites = this.table("invites");
  }
}

const db = new LocalStorageDatabase();

// Clear Database Function
export async function clearDatabase(): Promise<void> {
  await db.delete(); // Deletes the entire database
  await db.open(); // Reopen the database for further use
}

// Key Pair Functions
const KEY_PAIR_ID = "current";

export async function saveKeyPair(publicKey: string, privateKey: string): Promise<void> {
  await db.keyPairs.put({ id: KEY_PAIR_ID, publicKey, privateKey });
}

export async function getKeyPair(): Promise<{ publicKey: string; privateKey: string } | null> {
  const keyPair = await db.keyPairs.get(KEY_PAIR_ID);
  return keyPair ? { publicKey: keyPair.publicKey, privateKey: keyPair.privateKey } : null;
}

export async function deleteKeyPair(): Promise<void> {
  await db.keyPairs.delete(KEY_PAIR_ID);
}

// Invite Functions
export async function saveInvite(token: string): Promise<void> {
  await db.invites.put({ id: token, token, acceptedAt: new Date() });
}

export async function getInvites(): Promise<{ id: string; token: string; acceptedAt: Date }[]> {
  return await db.invites.toArray();
}

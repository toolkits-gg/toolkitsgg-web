import type {DalReadAction, DalWriteAction} from "#/features/dal/types.ts";

export type CollectItemInput = { itemId: string; itemName: string };

export type CollectedItemRecord = {
    userId: string;
    itemId: string;
    updatedAt?: Date | string | null;
};

export type GameCollectedItemsDal = {
    list: DalReadAction<void, CollectedItemRecord[]>;
    collect: DalWriteAction<CollectItemInput, CollectedItemRecord>;
    uncollect: DalWriteAction<CollectItemInput, { ok: true }>;
    listByUserIdServerFn: (input: {
        data: { userId: string };
    }) => Promise<CollectedItemRecord[]>;
};
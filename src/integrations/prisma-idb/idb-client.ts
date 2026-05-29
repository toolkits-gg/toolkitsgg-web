import { PrismaIDBClient } from "../../../prisma/generated/prisma-idb/client";

let clientPromise: Promise<PrismaIDBClient> | null = null;

const getIDBClient = async (): Promise<PrismaIDBClient> => {
	if (typeof window === "undefined") {
		throw new Error("getIDBClient can only be used in the browser");
	}

	if (!clientPromise) {
		clientPromise = PrismaIDBClient.createClient();
	}

	return clientPromise;
};

export { getIDBClient };

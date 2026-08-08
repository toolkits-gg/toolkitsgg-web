import type { prisma } from "@/prisma";

type PrismaTx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/**
 * Hides everything a user has published for one game, as part of a site-wide ban.
 *
 * Games implement this because the tables are theirs; the ban itself is generic
 * and must not name any of them. A game without publishable content simply has
 * no entry in the registry.
 *
 * `actorId` is the moderator issuing the ban, not its subject: hiding content
 * answers the review items filed against it, and those record who closed them.
 */
type HideUserContent = (
	tx: PrismaTx,
	userId: string,
	actorId: string,
) => Promise<void>;

export type { HideUserContent, PrismaTx };

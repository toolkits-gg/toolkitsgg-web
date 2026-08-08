import type { BuildVariantSetRef } from "#/features/game/data/types";
import { BuildCollectionDisplayMode, BuildVisibility, prisma } from "@/prisma";

/**
 * A variant set is visible to a viewer under the same rule the collection page
 * applies: PRIVATE is owner-only, everything else resolves for anyone holding
 * the link.
 */
const visibleSetWhere = (viewerId: string | null) => ({
	displayMode: BuildCollectionDisplayMode.VARIANTS,
	...(viewerId
		? {
				OR: [
					{ visibility: { not: BuildVisibility.PRIVATE } },
					{ createdById: viewerId },
				],
			}
		: { visibility: { not: BuildVisibility.PRIVATE } }),
});

/**
 * Annotates builds with the variant set they belong to.
 *
 * Sets the viewer may not see are left off rather than hidden behind a broken
 * link: a PUBLIC build inside a PRIVATE set is annotated only for its owner, so
 * a stranger still gets the ordinary build page.
 *
 * One query for the whole page, served by the `@@index([buildId])` on the join
 * table. Callers pass rows straight from Prisma, which carry no `variantSet`.
 */
const attachVariantSets = async <T extends { id: string }>(
	builds: T[],
	viewerId: string | null,
): Promise<(T & { variantSet: BuildVariantSetRef | null })[]> => {
	if (builds.length === 0) return [];

	// Keyed off the claim column, which is the same single-valued column the
	// database constrains, so membership here can never disagree with the rule
	// the writes enforce. The join row is consulted only for `position`.
	const claims = await prisma.remnant2Build.findMany({
		where: {
			id: { in: builds.map((build) => build.id) },
			VariantCollection: visibleSetWhere(viewerId),
		},
		select: {
			id: true,
			variantCollectionId: true,
			VariantCollection: {
				select: {
					name: true,
					_count: { select: { Builds: true } },
					// The position-0 member is the primary, which is the one a collapsed
					// listing shows and the one a bare set link opens on.
					Builds: {
						orderBy: { position: "asc" },
						take: 1,
						select: { buildId: true },
					},
				},
			},
		},
	});

	const byBuildId = new Map<string, BuildVariantSetRef>();
	for (const row of claims) {
		const set = row.VariantCollection;
		if (!set || !row.variantCollectionId) continue;
		const primary = set.Builds[0];
		byBuildId.set(row.id, {
			collectionId: row.variantCollectionId,
			name: set.name,
			variantCount: set._count.Builds,
			isPrimary: primary?.buildId === row.id,
		});
	}

	return builds.map((build) => ({
		...build,
		variantSet: byBuildId.get(build.id) ?? null,
	}));
};

export { attachVariantSets };

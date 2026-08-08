// Client-safe mirror of the Prisma `BuildVisibility` enum, so this validation
// module never references `@/prisma` at module scope.
const BUILD_VISIBILITY_VALUES = ["PUBLIC", "UNLISTED", "PRIVATE"] as const;

export { BUILD_VISIBILITY_VALUES };

import { useDalMutation } from "#/features/dal/use-dal-mutation.ts";
import { useDalQuery } from "#/features/dal/use-dal-query.ts";
import { createUserProfileDal } from "#/features/game/dal/user-profile/user-profile.dal.ts";
import { useSession } from "#/integrations/better-auth/auth-client.ts";
import type { GameId } from "@/prisma";

type UseUserProfileArgs = { userId?: string } | undefined;

const useUserProfile = (args?: UseUserProfileArgs) => {
	const { data: session, isPending: sessionPending } = useSession();
	const userProfileDal = createUserProfileDal();

	const profileQuery = useDalQuery(
		userProfileDal.getProfile,
		args?.userId ? { userId: args.userId } : undefined,
	);
	const updateAvatarMutation = useDalMutation(userProfileDal.updateAvatar);
	const removePrimaryAvatarMutation = useDalMutation(
		userProfileDal.removePrimaryAvatar,
	);
	const removeAvatarOverrideMutation = useDalMutation(
		userProfileDal.removeAvatarOverride,
	);

	const isAuthenticated = !!session?.user;
	const isLoading = sessionPending || profileQuery.isPending;
	const isOwner =
		!!session?.user && (!args?.userId || session.user.id === args.userId);

	return {
		profile: profileQuery.data ?? null,
		isAuthenticated,
		isOwner,
		isLoading,
		session,
		updateAvatar: (params: {
			avatarId: string;
			avatarGameId: GameId;
			targetGameId?: GameId;
		}) => updateAvatarMutation.mutateAsync(params),
		removePrimaryAvatar: () =>
			removePrimaryAvatarMutation.mutateAsync(
				undefined as unknown as undefined,
			),
		removeAvatarOverride: (targetGameId: GameId) =>
			removeAvatarOverrideMutation.mutateAsync({ targetGameId }),
	};
};

export { useUserProfile };

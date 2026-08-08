import {
	useRemoveAvatarOverride,
	useRemoveHeaderImageOverride,
	useRemovePrimaryAvatar,
	useRemovePrimaryHeaderImage,
	useUpdateAvatar,
	useUpdateHeaderImage,
	useUserProfileQuery,
} from "#/features/game/data/user-profile/use-user-profile-data";
import { useSession } from "#/integrations/better-auth/auth-client";
import type { GameId } from "@/prisma";

type UseUserProfileArgs = { userId?: string } | undefined;

const useUserProfile = (args?: UseUserProfileArgs) => {
	const { data: session, isPending: sessionPending } = useSession();

	const profileQuery = useUserProfileQuery(
		args?.userId ? { userId: args.userId } : undefined,
	);
	const updateAvatarMutation = useUpdateAvatar();
	const removePrimaryAvatarMutation = useRemovePrimaryAvatar();
	const removeAvatarOverrideMutation = useRemoveAvatarOverride();
	const updateHeaderImageMutation = useUpdateHeaderImage();
	const removePrimaryHeaderImageMutation = useRemovePrimaryHeaderImage();
	const removeHeaderImageOverrideMutation = useRemoveHeaderImageOverride();

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
		removePrimaryAvatar: () => removePrimaryAvatarMutation.mutateAsync(),
		removeAvatarOverride: (targetGameId: GameId) =>
			removeAvatarOverrideMutation.mutateAsync({ targetGameId }),
		updateHeaderImage: (params: {
			headerImageId: string;
			headerImageGameId: GameId;
			positionX?: number;
			positionY?: number;
			targetGameId?: GameId;
		}) => updateHeaderImageMutation.mutateAsync(params),
		removePrimaryHeaderImage: () =>
			removePrimaryHeaderImageMutation.mutateAsync(),
		removeHeaderImageOverride: (targetGameId: GameId) =>
			removeHeaderImageOverrideMutation.mutateAsync({ targetGameId }),
	};
};

export { useUserProfile };

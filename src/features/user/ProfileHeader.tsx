import {
	ActionIcon,
	Avatar,
	Box,
	Group,
	Skeleton,
	Stack,
	Text,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { LuCamera, LuImage, LuPencil } from "react-icons/lu";
import { imagePositionToCss } from "#/features/image-position/image-position";
import { AvatarPicker } from "#/features/user/AvatarPicker";
import { HeaderImagePicker } from "#/features/user/HeaderImagePicker";
import { ProfileEditForm } from "#/features/user/ProfileEditForm";
import { useResolvedAvatar } from "#/features/user/use-resolved-avatar";
import { useResolvedHeaderImage } from "#/features/user/use-resolved-header-image";
import { useUserProfile } from "#/features/user/use-user-profile";
import classes from "./ProfileHeader.module.css";

type ProfileHeaderProps = {
	userId?: string;
	isOwner: boolean;
};

const openAvatarPicker = () => {
	modals.open({
		title: "Choose avatar",
		size: "lg",
		children: <AvatarPicker />,
	});
};

const openHeaderImagePicker = () => {
	modals.open({
		title: "Choose header image",
		size: "lg",
		children: <HeaderImagePicker />,
	});
};

const openProfileEdit = (displayName: string, bio: string) => {
	modals.open({
		title: "Edit profile",
		children: (
			<ProfileEditForm initialDisplayName={displayName} initialBio={bio} />
		),
	});
};

type ProfileAvatarProps = {
	userId?: string;
	initials: string;
};

const ProfileAvatar = ({ userId, initials }: ProfileAvatarProps) => {
	const { avatarUrl } = useResolvedAvatar(userId ? { userId } : undefined);
	return (
		<Avatar src={avatarUrl} size={96} radius="md" className={classes.avatar}>
			{initials}
		</Avatar>
	);
};

/**
 * Most wallpaper filenames contain spaces, which an unquoted CSS url() token
 * cannot carry: the browser rejects the whole declaration and the banner falls
 * back to its gradient. Quoted so a future filename with parentheses survives
 * too, since encodeURI leaves those alone.
 */
const cssUrl = (url: string) => `url("${encodeURI(url)}")`;

type ProfileBannerProps = { userId?: string; isOwner: boolean };

const ProfileBanner = ({ userId, isOwner }: ProfileBannerProps) => {
	const { headerImageUrl, position } = useResolvedHeaderImage(
		userId ? { userId } : undefined,
	);

	return (
		<Box
			className={`${classes.banner} ${headerImageUrl ? classes.bannerWithImage : ""}`}
			style={
				headerImageUrl
					? {
							backgroundImage: cssUrl(headerImageUrl),
							backgroundPosition: imagePositionToCss(position),
						}
					: undefined
			}
		>
			{isOwner && (
				<ActionIcon
					variant="filled"
					size="sm"
					radius="xl"
					onClick={openHeaderImagePicker}
					aria-label="Change header image"
					className={classes.bannerAction}
				>
					<LuImage size={14} />
				</ActionIcon>
			)}
		</Box>
	);
};

const ProfileHeader = ({ userId, isOwner }: ProfileHeaderProps) => {
	const { profile, isLoading } = useUserProfile(
		userId ? { userId } : undefined,
	);

	if (isLoading && !profile) {
		return (
			<Box>
				<Box className={classes.banner} />
				<Box className={classes.profileContent}>
					<Group align="flex-end" gap="md">
						<Skeleton height={96} width={96} radius="md" />
						<Stack className={classes.info} gap={4}>
							<Skeleton height={24} width={160} />
							<Skeleton height={16} width={240} />
						</Stack>
					</Group>
				</Box>
			</Box>
		);
	}

	const displayName = profile?.displayName ?? "Traveler";
	const bio = profile?.bio ?? "";

	const initials = displayName
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return (
		<Box>
			<ProfileBanner userId={userId} isOwner={isOwner} />
			<Box className={classes.profileContent}>
				<Group align="flex-end" gap="md">
					<Box className={classes.avatarWrapper}>
						<ProfileAvatar userId={userId} initials={initials} />
						{isOwner && (
							<ActionIcon
								variant="filled"
								size="sm"
								radius="xl"
								onClick={openAvatarPicker}
								aria-label="Change avatar"
								style={{ position: "absolute", bottom: 4, right: 4 }}
							>
								<LuCamera size={14} />
							</ActionIcon>
						)}
					</Box>
					<Stack className={classes.info} gap={4}>
						<Group gap="xs" align="center">
							<Text fw={700} size="xl">
								{displayName}
							</Text>
							{isOwner && (
								<ActionIcon
									variant="subtle"
									size="sm"
									radius="xl"
									onClick={() => openProfileEdit(displayName, bio)}
									aria-label="Edit profile"
								>
									<LuPencil size={14} />
								</ActionIcon>
							)}
						</Group>
						<Text size="sm" c="dimmed">
							{bio}
						</Text>
					</Stack>
				</Group>
			</Box>
		</Box>
	);
};

export { ProfileHeader };

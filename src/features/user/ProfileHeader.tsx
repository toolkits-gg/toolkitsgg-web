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
import { LuCamera, LuPencil } from "react-icons/lu";
import { AvatarPicker } from "#/features/user/AvatarPicker.tsx";
import { ProfileEditForm } from "#/features/user/ProfileEditForm.tsx";
import { useResolvedAvatar } from "#/features/user/use-resolved-avatar.ts";
import { useUserProfile } from "#/features/user/use-user-profile.ts";
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
			<Box className={classes.banner} />
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

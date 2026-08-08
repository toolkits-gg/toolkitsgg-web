import { Button, Group, Modal, Stack, Text, Textarea } from "@mantine/core";
import { useState } from "react";

type ReasonModalProps = {
	opened: boolean;
	title: string;
	description: string;
	confirmLabel: string;
	danger?: boolean;
	// Actions that only reveal or restore content do not need justifying.
	reasonRequired?: boolean;
	onCancel: () => void;
	onConfirm: (reason: string) => void;
};

const ReasonModal = ({
	opened,
	title,
	description,
	confirmLabel,
	danger,
	reasonRequired = true,
	onCancel,
	onConfirm,
}: ReasonModalProps) => {
	const [reason, setReason] = useState("");

	const close = () => {
		setReason("");
		onCancel();
	};

	const confirm = () => {
		onConfirm(reason.trim());
		setReason("");
	};

	return (
		<Modal opened={opened} onClose={close} title={title} centered>
			<Stack gap="sm">
				<Text size="sm">{description}</Text>
				<Textarea
					label="Reason"
					description="Recorded in the audit log."
					autosize
					minRows={3}
					value={reason}
					onChange={(event) => setReason(event.currentTarget.value)}
				/>
				<Group justify="flex-end">
					<Button variant="default" onClick={close}>
						Cancel
					</Button>
					<Button
						color={danger ? "red" : undefined}
						disabled={reasonRequired && reason.trim().length === 0}
						onClick={confirm}
					>
						{confirmLabel}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};

export { ReasonModal };

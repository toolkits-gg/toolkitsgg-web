import { createHash } from "node:crypto";
import type { ReactElement } from "react";
import { getNoReplyFrom } from "#/features/email/utils";
import { logger } from "#/integrations/pino/logger";
import { consumeRateLimit } from "#/integrations/rate-limit/consume-rate-limit";
import { resend } from "#/integrations/resend/resend";

const RECIPIENT_LIMIT_MAX = 10;
const RECIPIENT_LIMIT_WINDOW_SEC = 60 * 60;

/**
 * Buckets are keyed by digest rather than address so the limiter table does not
 * become a queryable record of who has been sent mail, or targeted. Lowercasing
 * first also collapses casing variants onto one bucket.
 */
const recipientKey = (to: string) =>
	`email:${createHash("sha256").update(to.trim().toLowerCase()).digest("hex")}`;

type SendEmailArgs = {
	to: string;
	subject: string;
	react: ReactElement;
	/** Identifies the template in logs, e.g. "email-verification". */
	template: string;
};

/**
 * Sends a transactional email, resolving to whether it was accepted by Resend.
 *
 * Deliberately never throws. Every caller is a better-auth hook, and letting a
 * provider outage propagate would fail the sign-up or password-reset request
 * itself. Callers that need the user to act on a missed email rely on the
 * resend-verification flow instead.
 */
const sendEmail = async ({
	to,
	subject,
	react,
	template,
}: SendEmailArgs): Promise<boolean> => {
	try {
		// Caps mail per recipient, which the per-IP limits on the auth endpoints
		// structurally cannot do: sign-in and the public resend-verification form
		// both send to an attacker-supplied address, so rotating IPs would
		// otherwise flood one inbox and burn the sending domain's reputation.
		const key = recipientKey(to);
		const { allowed } = await consumeRateLimit({
			key,
			max: RECIPIENT_LIMIT_MAX,
			windowSec: RECIPIENT_LIMIT_WINDOW_SEC,
		});
		if (!allowed) {
			logger.warn({ template, key }, "Transactional email rate limited");
			return false;
		}

		const { data, error } = await resend.emails.send({
			from: getNoReplyFrom(),
			to,
			subject,
			react,
		});

		if (error) {
			logger.error({ template, error }, "Transactional email rejected");
			return false;
		}

		logger.info({ template, id: data?.id }, "Transactional email sent");
		return true;
	} catch (exception) {
		logger.error({ template, exception }, "Transactional email threw");
		return false;
	}
};

export { sendEmail };

import { useQuery } from "@tanstack/react-query";
import { authClient } from "#/integrations/better-auth/auth-client";

const ACCOUNTS_QUERY_KEY = ["auth", "accounts"];

const useAccounts = (enabled: boolean) =>
	useQuery({
		queryKey: ACCOUNTS_QUERY_KEY,
		queryFn: async () => {
			const result = await authClient.listAccounts();
			if (result.error) throw new Error(result.error.message);
			return result.data;
		},
		enabled,
	});

export { ACCOUNTS_QUERY_KEY, useAccounts };

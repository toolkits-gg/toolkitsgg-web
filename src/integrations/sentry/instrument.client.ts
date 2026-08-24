import * as Sentry from "@sentry/tanstackstart-react";

Sentry.init({
	dsn: "https://347c1989d311ac9464fea8bae7ea7469@o4511883768233984.ingest.us.sentry.io/4511883776163840",

	environment: import.meta.env.MODE,

	dataCollection: {
		// To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
		// https://docs.sentry.io/platforms/javascript/guides/tanstackstart-react/configuration/options/#dataCollection
		// userInfo: false,
		// httpBodies: [],
	},

	tracesSampleRate: 1.0,

	// Enable logs to be sent to Sentry
	enableLogs: true,
});

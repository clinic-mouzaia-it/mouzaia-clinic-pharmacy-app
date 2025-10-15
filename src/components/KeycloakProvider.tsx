import { ReactNode, useEffect, useState } from "react";
import { LoadingOverlay } from "@mantine/core";
import keycloak from "../config/keycloak";

interface KeycloakProviderProps {
	children: ReactNode;
}

export const KeycloakProvider = ({ children }: KeycloakProviderProps) => {
	const [authenticated, setAuthenticated] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		keycloak
			.init({
				onLoad: "login-required",
				checkLoginIframe: false,
			})
			.then((auth) => {
				setAuthenticated(auth);
				setLoading(false);
			})
			.catch((error) => {
				console.error("Keycloak initialization failed:", error);
				setLoading(false);
			});
	}, []);

	if (loading) {
		return <LoadingOverlay visible />;
	}

	if (!authenticated) {
		return <div>Unable to authenticate</div>;
	}

	return <>{children}</>;
};

export { keycloak };

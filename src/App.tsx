import {
	MantineProvider,
	AppShell,
	Container,
	Title,
	Group,
	Button,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { IconTrash } from "@tabler/icons-react";
import MedicinesList from "./components/MedicinesList";
import DeletedMedicinesList from "./components/DeletedMedicinesList";
import DistributionsList from "./components/DistributionsList";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { KeycloakProvider } from "./components/KeycloakProvider";
import keycloak from "./config/keycloak";

function AppContent() {
	const location = useLocation();
	const isDeletedPage = location.pathname === "/deleted";
	const isDistributionsPage = location.pathname === "/distributions";

	// Check if user has permission to see deleted medicines
	const hasViewDeletedPermission = keycloak.hasResourceRole(
		"allowed_to_see_deleted_medicines",
		"pharmacy-service"
	);
	// Check if user has permission to see distributions
	const hasViewDistributions = keycloak.hasResourceRole(
		"allowed_to_see_distributions",
		"pharmacy-service"
	);

	return (
		<AppShell header={{ height: 60 }} padding="md">
			<AppShell.Header>
				<Container
					size="xl"
					h="100%"
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<Title order={3}>Mouzaia Clinic - Pharmacy</Title>
					<Group gap="md">
						{hasViewDistributions && !isDistributionsPage && (
							<Button
								component={Link}
								to="/distributions"
								variant="subtle"
								color="gray"
							>
								Distributions
							</Button>
						)}
						{hasViewDeletedPermission && !isDeletedPage && (
							<Button
								component={Link}
								to="/deleted"
								leftSection={<IconTrash size={18} />}
								variant="subtle"
								color="gray"
							>
								Deleted Medicines
							</Button>
						)}
					</Group>
				</Container>
			</AppShell.Header>

			<AppShell.Main>
				<Container size="xl">
					<Routes>
						<Route path="/" element={<MedicinesList />} />
						<Route path="/deleted" element={<DeletedMedicinesList />} />
						<Route path="/distributions" element={<DistributionsList />} />
					</Routes>
				</Container>
			</AppShell.Main>
		</AppShell>
	);
}

function App() {
	return (
		<MantineProvider>
			<ModalsProvider>
				<Notifications />
				<KeycloakProvider>
					<BrowserRouter>
						<AppContent />
					</BrowserRouter>
				</KeycloakProvider>
			</ModalsProvider>
		</MantineProvider>
	);
}

export default App;

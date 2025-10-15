import {
	MantineProvider,
	AppShell,
	Container,
	Title,
	Text,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import MedicinesList from "./components/MedicinesList";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { KeycloakProvider } from "./components/KeycloakProvider";

function App() {
	return (
		<MantineProvider>
			<ModalsProvider>
				<Notifications />
				<KeycloakProvider>
					<AppShell
						header={{ height: 60 }}
						padding='md'
					>
						<AppShell.Header>
							<Container
								size='xl'
								h='100%'
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
								}}
							>
								<Title order={3}>Mouzaia Clinic - Pharmacy</Title>
								<Text size='sm'>Pharmacy Management</Text>
							</Container>
						</AppShell.Header>

						<AppShell.Main>
							<Container size='xl'>
								<MedicinesList />
							</Container>
						</AppShell.Main>
					</AppShell>
				</KeycloakProvider>
			</ModalsProvider>
		</MantineProvider>
	);
}

export default App;

import keycloak from "../config/keycloak";
import type {
	Medicine,
	MedicineCreate,
	StaffUser,
	DistributeRequest,
	DistributeResponse,
	ApiError,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ApiService {
	private async getHeaders(): Promise<HeadersInit> {
		// Refresh token if it expires in 5 seconds
		await keycloak.updateToken(5);

		return {
			"Content-Type": "application/json",
			Authorization: `Bearer ${keycloak.token}`,
		};
	}

	async getMedicines(): Promise<Medicine[]> {
		const headers = await this.getHeaders();
		const response = await fetch(`${API_BASE_URL}/pharmacy/medicines`, {
			headers,
		});

		if (!response.ok) {
			const error: ApiError = await response.json();
			throw new Error(error.message || error.error);
		}

		return response.json();
	}

	async createMedicine(medicine: MedicineCreate): Promise<Medicine> {
		const headers = await this.getHeaders();
		const response = await fetch(`${API_BASE_URL}/pharmacy/medicines`, {
			method: "POST",
			headers,
			body: JSON.stringify(medicine),
		});

		if (!response.ok) {
			const error: ApiError = await response.json();
			throw new Error(error.message || error.error);
		}

		return response.json();
	}

	async deleteMedicine(id: string): Promise<Medicine> {
		const headers = await this.getHeaders();
		const response = await fetch(
			`${API_BASE_URL}/pharmacy/medicines/${id}/soft-delete`,
			{
				method: "DELETE",
				headers,
			}
		);

		if (!response.ok) {
			const error: ApiError = await response.json();
			throw new Error(error.message || error.error);
		}

		return response.json();
	}

	async getUserByNationalId(nationalId: string): Promise<StaffUser> {
		const headers = await this.getHeaders();
		const response = await fetch(
			`${API_BASE_URL}/users/by-national-id?nationalId=${encodeURIComponent(
				nationalId
			)}`,
			{
				headers,
			}
		);

		if (!response.ok) {
			const error: ApiError = await response.json();
			throw new Error(error.message || error.error);
		}

		return response.json();
	}

	async distributeMedicines(
		request: DistributeRequest
	): Promise<DistributeResponse> {
		const headers = await this.getHeaders();
		const response = await fetch(
			`${API_BASE_URL}/pharmacy/medicines/distribute`,
			{
				method: "POST",
				headers,
				body: JSON.stringify(request),
			}
		);

		if (!response.ok) {
			const error: ApiError = await response.json();
			throw new Error(error.message || error.error);
		}

		return response.json();
	}
}

export const apiService = new ApiService();

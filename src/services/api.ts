import keycloak from "../config/keycloak";
import type {
	Medicine,
	MedicineCreate,
	MedicineUpdate,
	StaffUser,
	DistributeRequest,
	DistributeResponse,
	RestoreResponse,
	ApiError,
	DistributionsListResponse,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ApiService {
	private async getHeaders(includeContentType: boolean = true): Promise<HeadersInit> {
		// Refresh token if it expires in 5 seconds
		await keycloak.updateToken(5);

		const headers: HeadersInit = {
			Authorization: `Bearer ${keycloak.token}`,
		};
		
		if (includeContentType) {
			headers["Content-Type"] = "application/json";
		}
		
		return headers;
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

	async getDeletedMedicines(): Promise<Medicine[]> {
		const headers = await this.getHeaders();
		const response = await fetch(`${API_BASE_URL}/pharmacy/medicines/deleted`, {
			headers,
		});

		if (!response.ok) {
			const error: ApiError = await response.json();
			throw new Error(error.message || error.error);
		}

		return response.json();
	}

	async restoreMedicine(id: string): Promise<RestoreResponse> {
		const headers = await this.getHeaders(false);
		const response = await fetch(
			`${API_BASE_URL}/pharmacy/medicines/${id}/restore`,
			{
				method: "PATCH",
				headers,
			}
		);

		if (!response.ok) {
			const error: ApiError = await response.json();
			throw new Error(error.message || error.error);
		}

		if (response.status === 204) {
			return {
				success: true,
				message: "Medicine restored successfully",
				medicine: {} as any,
			};
		}

		return response.json();
	}

	async updateMedicine(id: string, payload: MedicineUpdate): Promise<Medicine> {
		const headers = await this.getHeaders();
		const response = await fetch(`${API_BASE_URL}/pharmacy/medicines/${id}`, {
			method: "PATCH",
			headers,
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const error: ApiError = await response.json();
			throw new Error(error.message || error.error);
		}

		return response.json();
	}

	async getDistributions(params?: {
		staffNationalId?: string;
		medicineId?: string;
		limit?: number;
		offset?: number;
	}): Promise<DistributionsListResponse> {
		const headers = await this.getHeaders(false);
		const query = new URLSearchParams();
		if (params?.staffNationalId) query.set("staffNationalId", params.staffNationalId);
		if (params?.medicineId) query.set("medicineId", params.medicineId);
		if (params?.limit) query.set("limit", String(params.limit));
		if (params?.offset) query.set("offset", String(params.offset));

		const url = `${API_BASE_URL}/pharmacy/distributions${query.toString() ? `?${query.toString()}` : ""}`;
		const response = await fetch(url, { headers });

		if (!response.ok) {
			const error: ApiError = await response.json();
			throw new Error(error.message || error.error);
		}

		return response.json();
	}
}

export const apiService = new ApiService();

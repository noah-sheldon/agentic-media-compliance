import { ScreeningResult, TestCaseRecord } from "@/types/screening";

const DEFAULT_BASE = "http://localhost:8000/api";
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  process.env.NEXT_PUBLIC_API_URL ??
  DEFAULT_BASE;

export interface ScreeningPayload {
  name: string;
  url: string;
  dob?: string | null;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Request failed");
  }
  return (await res.json()) as T;
}

export async function runScreeningRequest(
  payload: ScreeningPayload
): Promise<ScreeningResult> {
  const response = await fetch(`${API_BASE}/run_screening`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<ScreeningResult>(response);
}

export async function fetchTestResults(): Promise<TestCaseRecord[]> {
  const response = await fetch(`${API_BASE}/tests`, { cache: "no-store" });
  const payload = await handleResponse<{ results: TestCaseRecord[] }>(response);
  return payload.results ?? [];
}

export interface HealthCheckResponse {
  status: string;
  service: string;
  version: string;
  gatewayStatus?: string;
  url?: string;
}

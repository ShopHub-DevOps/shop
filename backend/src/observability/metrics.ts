import promClient from 'prom-client';

export const register = new promClient.Registry();

// Metrics
export const httpRequestTotal = new promClient.Counter({
  name: 'shop_http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const httpRequestDuration = new promClient.Histogram({
  name: 'shop_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register],
});

export const httpResponseSize = new promClient.Histogram({
  name: 'shop_http_response_bytes',
  help: 'HTTP response size in bytes',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [100, 1000, 10000, 100000, 1000000],
  registers: [register],
});

export const http404Total = new promClient.Counter({
  name: 'shop_http_404_total',
  help: '404 errors by route',
  labelNames: ['route'],
  registers: [register],
});

export const uniqueVisitors = new promClient.Gauge({
  name: 'shop_unique_visitors',
  help: 'Approximate unique visitors',
  registers: [register],
});

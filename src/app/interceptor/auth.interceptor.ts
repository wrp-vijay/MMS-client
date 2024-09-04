import { HttpInterceptorFn, HttpHeaders } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log(`Request URL: ${req.url}`);

  // Skip interception for specific URLs
  if (req.url.includes('login')) {
    return next(req); // Pass through the request without modification
  }

  // Add headers for other requests
  const token = localStorage.getItem('token');
  const apiKey = 'your-api-key'; // Replace with your actual API key

  let headers = new HttpHeaders();

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  headers = headers.set('x-api-key', apiKey);

  const modifiedReq = req.clone({ headers });

  return next(modifiedReq);
};

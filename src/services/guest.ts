import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/env/environment'; 

export interface GuestLinkRequest {
  destination: string;
  backHalf?: string;
}

export interface GuestLinkResponse {
  details: {
    backHalf: string;
    destination: string;
    shortLink: string;
    expiresIn?: string;
  };
  shortUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class GuestLinkService {
  private apiUrl = `${environment.apiUrl}/try`; 

  constructor(private http: HttpClient) {}

  createGuestLink(data: GuestLinkRequest): Observable<GuestLinkResponse> {
    return this.http.post<GuestLinkResponse>(this.apiUrl, data);
  }
}
import { Injectable } from '@angular/core';

export interface ServerConfig {
  apiUrl: string;
  timeout: number;
  retryAttempts: number;
  refreshInterval: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: ServerConfig = {
    apiUrl: 'http://localhost:8080/api',
    timeout: 10000,
    retryAttempts: 2,
    refreshInterval: 30000
  };

  constructor() {
    this.loadConfig();
  }

  getConfig(): ServerConfig {
    return this.config;
  }

  updateConfig(newConfig: Partial<ServerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  private loadConfig(): void {
    const savedConfig = localStorage.getItem('dashboard-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        this.config = { ...this.config, ...parsed };
      } catch (error) {
        console.error('Error loading config:', error);
      }
    }
  }

  private saveConfig(): void {
    localStorage.setItem('dashboard-config', JSON.stringify(this.config));
  }

  // הגדרות שרת נפוצות
  setProductionConfig(): void {
    this.updateConfig({
      apiUrl: 'https://your-production-server.com/api',
      timeout: 15000,
      retryAttempts: 3
    });
  }

  setDevelopmentConfig(): void {
    this.updateConfig({
      apiUrl: 'http://localhost:8080/api',
      timeout: 10000,
      retryAttempts: 2
    });
  }

  setTestingConfig(): void {
    this.updateConfig({
      apiUrl: 'http://localhost:3000/api',
      timeout: 5000,
      retryAttempts: 1
    });
  }
}
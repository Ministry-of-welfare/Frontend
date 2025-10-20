// Interface לנתונים שמגיעים מהשרת (עם אותיות קטנות)
export interface ServerSystems {
  systemId: number;
  systemCode: string;
  systemName: string;
  ownerEmail?: string;
}

export interface ServerDataSourceType {
  dataSourceTypeId: number;
  dataSourceTypeDesc?: string;
}
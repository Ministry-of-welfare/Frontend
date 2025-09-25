export class ImportControl {
 ImportControlId ?: number;
 ImportDataSourceId ?: number;
 ImportStartDate ?: Date;
 ImportFinishDate ?: Date | null;
 TotalRows? : number | null;
 TotalRowsAffected ?: number | null;
 RowsInvalid ?: number | null;
 FileName ?: string;
 ErrorReportPath ?: string | null;
}
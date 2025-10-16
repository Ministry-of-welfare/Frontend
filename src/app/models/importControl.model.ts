export class ImportControl {
 importControlId ?: number;
 importDataSourceId ?: number;
 importStartDate ?: Date;
 importFinishDate ?: Date | null;
 totalRows? : number | null;
 totalRowsAffected ?: number | null;
 rowsInvalid ?: number | null;
 fileName ?: string;
 errorReportPath ?: string | null;
}
export class CaptureData {
    importControlId!: number;
    importDataSourceId!: number; // חשוב לשם ה-join
    importDataSourceDesc!: string;
    systemName!: string;
    fileName!: string;
    importStartDate!: string | null;
    importFinishDate!: string | null;
    totalRows!: number | null;
    totalRowsAffected!: number | null;
    rowsInvalid!: number | null;
    importStatusId!: number | null;
    urlFileAfterProcess!: string | null;
    errorReportPath!: string | null;
}

export class ImportDataSources {
    importDataSourceId!: number;
    importDataSourceDesc?: string;
    dataSourceTypeId!: number;
    systemId?: number;
    jobName?: string;
    tableName!: string;
    urlFile!: string;
    urlFileAfterProcess!:string;
    endDate?: Date | string;
    errorRecipients?: string;
    insertDate!: Date | string;
    startDate?: Date | string;
    // dataSourceType: null,
    // tabImportErrors: []
   
}
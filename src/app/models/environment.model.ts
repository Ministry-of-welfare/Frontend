export class Environment {
    environmentId!: number;
    environmentCode!: 'DEV' | 'TEST' | 'PREPROD' | 'PROD';
    environmentName!: 'Development' | 'Test' | 'Preprod' | 'Production';
    description?: string;
}

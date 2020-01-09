import { Schema, Model, Document } from "mongoose";

declare module 'lib' {
  namespace models {
    namespace personasImport {
      export interface PersonasImportError {
        row: number;
        rowErrors: string[];
      }

      export interface PersonasImportResult {
        created: number;
        merged: number;
      }

      export interface PersonaImportField {
        columnName?: string;
        columnType?: string;
        relatedColumn?: string;
        primary?: number;
        attributeName?: string;
        useConstant?: boolean;
        constant?: string;
      }

      export interface PersonasImportStructure {
        [key: string]: PersonaImportField;
      }

      export interface PersonasImport {
        title: string;
        owner: any; // TODO: define type
        organisation: any; // TODO: define type
        csvHandle: string;
        csvErrorHandle: string;
        importStage: string; // TODO: add enum
        totalCount: number;
        processedCount: number;
        csvHeaders: string[];
        importedAt: Date;
        importErrors: PersonasImportError[];
        result: PersonasImportResult;
        structure: PersonasImportStructure;
      }

      export interface PersonasImportDocument extends Document {}

      export interface PersonasImportSchema extends Schema<PersonasImport> {}

      export interface PersonasImportModel extends Model<PersonasImportDocument> {}
    }
  }
}

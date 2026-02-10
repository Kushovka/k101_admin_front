export interface UserAdditionalDataField {
  value?: string;
}

export interface UserAdditionalData {
  Регион?: UserAdditionalDataField;
  serial?: UserAdditionalDataField;
  number?: UserAdditionalDataField;
}

export type GroupedFieldValue =
  | string
  | {
      value?: string;
    };

export interface GroupedDataGroup {
  group_name: string;
  sources: SourceFile[];
  fields: Record<string, GroupedFieldValue>;
}

export type GroupedData = Record<string, GroupedDataGroup>;

export interface SourceFile {
  raw_file_id: string;
  file_name: string | null;
  display_name: string | null;
  file_description: string | null;
  upload_date: string | null;
}

export interface SearchUser {
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  age?: number;
  gender?: string;
  entity_id: string;

  birthdays?: string[];
  ipn?: string[];
  birthday?: string;

  grouped_data?: GroupedData;

  phones?: string[];
  emails?: string[];
  cities?: string[];
  addresses?: string[];
  snils?: string[];

  source_files?: SourceFile[];
  additional_data?: UserAdditionalData;
}

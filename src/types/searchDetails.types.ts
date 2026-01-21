export interface UserAdditionalDataField {
  value?: string;
}

export interface UserAdditionalData {
  Регион?: UserAdditionalDataField;
  serial?: UserAdditionalDataField;
  number?: UserAdditionalDataField;
}

export interface SearchUser {
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  age?: number;

  birthdays?: string[];
  birthday?: string;

  phones?: string[];
  emails?: string[];
  cities?: string[];
  addresses?: string[];
  snils?: string[];

  additional_data?: UserAdditionalData;
}

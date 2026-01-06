import { Dispatch, SetStateAction } from "react";

export interface SidebarContextValue {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

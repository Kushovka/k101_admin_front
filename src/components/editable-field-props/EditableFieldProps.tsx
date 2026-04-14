import React, { useEffect, useState } from "react";
import { FaPen } from "react-icons/fa";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";

interface EditableFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onChange,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [tempValue, setTempValue] = useState<string>(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const save = (): void => {
    onChange(tempValue);
    setIsEditing(false);
  };

  const cancel = (): void => {
    setTempValue(value);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between gap-5 text-gray01 min-h-[24px]">
      <p className="text-slate-600">{label}:</p>
      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") cancel();
            }}
          />
          <IoMdCheckmark
            data-testid="checkmark-icon"
            className="cursor-pointer w-[24px] h-[24px] text-green-500"
            onClick={save}
          />
          <IoMdClose
            data-testid="cancel-icon"
            className="cursor-pointer w-[24px] h-[24px] text-red-500"
            onClick={cancel}
          />
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="font-medium text-slate-900">{value}</span>
          <FaPen
            className="cursor-pointer text-slate-400 hover:text-slate-600 transition"
            onClick={() => setIsEditing(true)}
            data-testid="pencil-icon"
          />
        </div>
      )}
    </div>
  );
};

export default EditableField;

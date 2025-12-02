import { useEffect, useState } from "react";
import { FaPen } from "react-icons/fa";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";

const EditableField = ({ label, value, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const save = () => {
    onChange(tempValue);
    setIsEditing(false);
  };

  const cancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-5 text-gray01">
      <p>{label}:</p>
      {isEditing ? (
        <>
          <input
            type="text"
            className="border rounded px-2 py-1"
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
            className="cursor-pointer w-[30px] h-[30px] text-green-500"
            onClick={save}
          />
          <IoMdClose
            data-testid="cancel-icon"
            className="cursor-pointer w-[30px] h-[30px] text-red-500"
            onClick={cancel}
          />
        </>
      ) : (
        <>
          <span className="text-black">{value}</span>
          <FaPen
            className="cursor-pointer"
            onClick={() => setIsEditing(true)}
            data-testid="pencil-icon"
          />
        </>
      )}
    </div>
  );
};

export default EditableField;

import { createContext, useContext, useState } from "react";

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    person_id: "",
    email: "",
    age: "",
  });
  const [result, setResult] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [res, setRes] = useState(0);

  return (
    <SearchContext.Provider
      value={{
        form,
        setForm,
        result,
        setResult,
        currentPage,
        setCurrentPage,
        totalPages,
        setTotalPages,
        res,
        setRes,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);

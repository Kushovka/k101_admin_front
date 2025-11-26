import clsx from "clsx";

const Search = () => {
  const chapterTitleSearch = [
    { id: 1, title: "№" },
    { id: 2, title: "name" },
    { id: 3, title: "phone" },
    { id: 4, title: "person_id" },
    { id: 5, title: "page" },
    { id: 6, title: "page_size" },
  ];
  return (
    <section className="p-6 flex flex-col gap-10">
      <div className="flex flex-col gap-5">
        <div className="title">Поиск</div>
        <form action="" className="flex flex-col gap-4 w-[250px]">
          <input
            type="text"
            placeholder="*name"
            className="border-2 rounded-[6px] px-3"
          />
          <input
            type="text"
            placeholder="*phone"
            className="border-2 rounded-[6px] px-3"
          />
          <input
            type="text"
            placeholder="*person_id"
            className="border-2 rounded-[6px] px-3"
          />
          <input
            type="text"
            placeholder="*page"
            className="border-2 rounded-[6px] px-3"
          />
          <input
            type="text"
            placeholder="*page_size"
            className="border-2 rounded-[6px] px-3"
          />
          <button className="bg-[#006dd2]/80 text-white rounded py-1 uppercase hover:bg-[#006dd2] transition duration-300">
            найти
          </button>
        </form>
      </div>
      <div className="grid grid-cols-6 gap-4 text-gray-600 font-medium border-b pb-2">
        {chapterTitleSearch.map((chapter) => (
          <span
            className={clsx(
              " flex items-center justify-center text-[12px]",
              chapter.id === chapterTitleSearch.length ? "" : "border-r"
            )}
            key={chapter.id}
          >
            {chapter.title}
          </span>
        ))}
      </div>
    </section>
  );
};

export default Search;

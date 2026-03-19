import { CgDanger } from "react-icons/cg";

const SessionExpiredModal = () => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[3px] flex items-center justify-center z-50">
      <div className="bg-white w-[380px] rounded-2xl shadow-2xl border border-gray-100 p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center border border-yellow-100">
            <CgDanger className="w-9 h-9 text-yellow-400/60" />
          </div>

          <h3 className="text-[18px] font-semibold">Сессия истекла</h3>

          <p className="text-[14px] text-gray-600 text-center leading-snug">
            Пожалуйста войдите снова чтобы продолжить работу.
          </p>
        </div>

        <div className="mt-5 flex justify-center">
          <button
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors"
            onClick={() => {
              localStorage.removeItem("admin_access_token");
              window.location.href = "/sign-in";
            }}
          >
            Войти снова
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredModal;

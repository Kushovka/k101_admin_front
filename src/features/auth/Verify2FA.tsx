// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { verify2FA } from "./auth";

// export default function Verify2FA() {
//   const [code, setCode] = useState("");
//   const navigate = useNavigate();

//   const sessionId = localStorage.getItem("session_id");

//   useEffect(() => {
//     if (!sessionId) navigate("/signin");
//   }, []);

//   const submit = async () => {
//     try {
//       await verify2FA(sessionId!, code);
//       localStorage.removeItem("session_id");
//       navigate("/account/upload-files");
//     } catch {
//       alert("Неверный или истёкший код");
//       localStorage.removeItem("session_id");
//       navigate("/signin");
//     }
//   };

//   return (
//     <section className="flex items-center justify-center h-screen">
//       <div className="flex flex-col gap-4 bg-white p-8 rounded w-80">
//         <h3 className="text-xl text-center">Код из Telegram</h3>

//         <input
//           className="border p-2 rounded"
//           placeholder="123456"
//           maxLength={6}
//           onChange={(e) => setCode(e.target.value)}
//         />

//         <button
//           disabled={code.length !== 6}
//           onClick={submit}
//           className="bg-blue-600 text-white py-2 rounded disabled:opacity-50"
//         >
//           Подтвердить
//         </button>
//       </div>
//     </section>
//   );
// }

import { useState } from "react";
import { supabase } from "../lib/Store";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("abc@gmail.com");
  const [password, setPassword] = useState("123456");
  const [openTab, setOpenTab] = useState(1);
  const handleLogin = async (type) => {
    if ((!username || !password || !email) && type === "SIGNUP") {
      alert("All fields are required.");
      return;
    } else if (!email || !password) {
      alert("All fields are required.");
      return;
    }
    try {
      const {
        error,
        data: { user },
      } =
        type === "LOGIN"
          ? await supabase.auth.signInWithPassword({
              email: email,
              password,
            })
          : await supabase.auth.signUp({
              email: email,
              password,
              options: {
                data: {
                  username,
                },
              },
            });
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/");
      }
      if (error) {
        alert("Error with auth: " + error.message);
      } else if (!user)
        alert("Signup successful, confirmation mail should be sent soon!");
    } catch (error) {
      alert(error.error_description || error);
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center p-4 bg-gray-300">
      <div className="w-full sm:w-1/2 xl:w-1/3">
        <div className="border-teal p-8 border-t-12 bg-white mb-6 rounded-lg shadow-lg">
          <h2 className="text-center mb-1 text-lg font-normal">Code Edit</h2>
          <ul className="flex space-x-2 justify-center">
            <li>
              <a
                href="#"
                onClick={() => setOpenTab(1)}
                className={
                  "inline-block px-4 py-2  rounded shadow" +
                  (openTab === 1 ? " bg-green-400" : "")
                }
              >
                Login
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={() => setOpenTab(2)}
                className={
                  "inline-block px-4 py-2  rounded shadow" +
                  (openTab === 2 ? " bg-green-400" : "")
                }
              >
                Signup
              </a>
            </li>
          </ul>
          {openTab === 2 && (
            <div className="mb-4">
              <label className="font-bold text-grey-darker block mb-2">
                User Name
              </label>
              <input
                type="text"
                className="block appearance-none w-full bg-white border border-grey-light hover:border-grey px-2 py-2 rounded shadow"
                placeholder="Your Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}
          <div className="mb-4">
            <label className="font-bold text-grey-darker block mb-2">
              Email
            </label>
            <input
              type="text"
              className="block appearance-none w-full bg-white border border-grey-light hover:border-grey px-2 py-2 rounded shadow"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="font-bold text-grey-darker block mb-2">
              Password
            </label>
            <input
              type="password"
              className="block appearance-none w-full bg-white border border-grey-light hover:border-grey px-2 py-2 rounded shadow"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            {openTab === 2 ? (
              <a
                onClick={(e) => {
                  e.preventDefault();
                  handleLogin("SIGNUP");
                }}
                className="bg-green-700 hover:bg-teal text-white py-2 px-4 rounded text-center transition duration-150 hover:bg-green-600 hover:text-white"
              >
                Sign up
              </a>
            ) : (
              <a
                onClick={(e) => {
                  e.preventDefault();
                  handleLogin("LOGIN");
                }}
                className="border border-green-700 text-green-700 py-2 px-4 rounded w-full text-center transition duration-150 hover:bg-green-700 hover:text-white"
              >
                Login
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

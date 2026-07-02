import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Login = () => {

  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
      e.target.value,
    });
  };

  const handleSubmit =
  async (e) => {

    e.preventDefault();

    try {

      const response =
      await fetch(
        "http://localhost:3000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
            "application/json",
          },
          body:
          JSON.stringify(formData),
        }
      );

      const data =
      await response.json();
      console.log("Login response:", data);
      if (response.ok) {

        localStorage.setItem(
          "token",
          data.token
        );

        navigate("/dashboard");

      } else {

        alert(data.message);

      }

    } catch (error) {

      console.log(error);

    }
  };

  return (
    <div
      className="
      min-h-screen
      bg-[#0f172a]
      flex
      items-center
      justify-center
      p-4
    "
    >
      <div
        className="
        w-full
        max-w-md
        p-8
        rounded-3xl

        bg-white/10
        backdrop-blur-xl

        border
        border-white/10

        shadow-2xl
        shadow-black/30
      "
      >
        <div className="mb-8 text-center">

          <h1
            className="
            text-4xl
            font-bold
            text-white
          "
          >
            Welcome Back
          </h1>

          <p
            className="
            text-slate-400
            mt-2
          "
          >
            Sign in to your account
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div>

            <label
              className="
              block
              text-slate-300
              mb-2
            "
            >
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="
                w-full
                px-4
                py-3

                rounded-xl

                bg-white/5
                border
                border-white/10

                text-white

                placeholder-slate-500

                focus:outline-none
                focus:border-violet-500
              "
              required
            />

          </div>

          <div>

            <label
              className="
              block
              text-slate-300
              mb-2
            "
            >
              Password
            </label>

            <div className="relative">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="
                  w-full
                  px-4
                  py-3

                  rounded-xl

                  bg-white/5
                  border
                  border-white/10

                  text-white

                  placeholder-slate-500

                  focus:outline-none
                  focus:border-violet-500
                "
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              >
                {showPassword
                  ? <EyeOff size={20} />
                  : <Eye size={20} />}
              </button>

            </div>

          </div>

          <button
            type="submit"
            className="
              w-full

              py-3

              rounded-xl

              bg-gradient-to-r
              from-violet-600
              to-fuchsia-600

              text-white
              font-semibold

              hover:scale-[1.02]

              transition-all
            "
          >
            Login
          </button>

          <p
            className="
            text-center
            text-slate-400
          "
          >
            Don't have an account?

            <span
              onClick={() =>
                navigate("/")
              }
              className="
                ml-2
                text-violet-400
                cursor-pointer
                hover:underline
              "
            >
              Sign Up
            </span>

          </p>

        </form>

      </div>
    </div>
  );
};

export default Login;
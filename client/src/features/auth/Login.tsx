import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { Eye, EyeOff } from "lucide-react";
import api, { getCsrfCookie } from "../../api/axios";
import { useDispatch } from "react-redux";
import { startLogin } from "../../redux/slices/authSlice";

function Login() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await getCsrfCookie();
      const data = await api.post("/api/login", { email, password });
      if (data.status === 200) {
        setLoading(false);
        dispatch(startLogin());
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Login first to your account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Input your registered email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#121828] focus:border-transparent outline-none transition"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Input your password account"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#121828] focus:border-transparent outline-none transition pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff size={20} className="text-gray-500 cursor-pointer" />
                ) : (
                  <Eye size={20} className="text-gray-500 cursor-pointer" />
                )}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#121828] focus:ring-[#121828]"
              />
              <span className="text-sm text-gray-600">Remember Me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-[#121828] hover:underline"
            >
              Forgot Password
            </Link>
          </div>

          {/* Login button */}
          <button
            type="submit"
            className={`w-full ${email && password ? "opacity-100" : "opacity-50 cursor-not-allowed"} py-3 bg-[#121828]/90 cursor-pointer hover:bg-[#121828] text-white font-medium rounded-lg transition`}
            disabled={!email || !password}
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>

        {/* Create account link */}
        <p className="text-center mt-6 text-sm text-gray-600">
          You're new in here?{" "}
          <Link
            to="/register"
            className="text-cyan-600 hover:underline font-medium"
          >
            Create Account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Login;

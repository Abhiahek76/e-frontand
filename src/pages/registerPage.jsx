import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import MainLayout from "../components/layout/MainLayout";

import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { registerThunk } from "../store/authSlice";
import { mergeGuestCart, fetchCart } from "../store/cartSlice";

const passwordRequirements = [
  { label: "At least 8 characters", check: (p) => p.length >= 8 },
  { label: "Contains a number", check: (p) => /\d/.test(p) },
  { label: "Contains uppercase letter", check: (p) => /[A-Z]/.test(p) },
];

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoading } = useSelector((s) => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    const allOk = passwordRequirements.every((r) => r.check(password));
    if (!allOk) {
      toast.error("Password does not meet requirements");
      return;
    }

    try {
      const promise = dispatch(
        registerThunk({ name, email, password })
      ).unwrap();

      toast.promise(promise, {
        loading: "Creating account...",
        success: "Account created successfully!",
        error: (msg) => msg || "Registration failed",
      });

      await promise;

      try {
        await dispatch(mergeGuestCart()).unwrap();
      } catch (err) {}

      try {
        await dispatch(fetchCart()).unwrap();
      } catch (err) {}

      // clear form
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      const from = location.state?.from || "/";
      navigate(from, { replace: true });
    } catch (err) {}
  };

  return (
    <MainLayout>
      <div className="container-custom py-12 lg:py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-serif font-semibold text-foreground mb-2">
              Create Account
            </h1>
            <p className="text-muted-foreground">
              Join us and start shopping today
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {password && (
                  <div className="mt-3 space-y-2">
                    {passwordRequirements.map((req) => {
                      const ok = req.check(password);
                      return (
                        <div
                          key={req.label}
                          className={`flex items-center gap-2 text-xs ${
                            ok ? "text-green-600" : "text-muted-foreground"
                          }`}
                        >
                          <Check
                            className={`w-3.5 h-3.5 ${
                              ok ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          {req.label}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-md
                           bg-primary text-primary-foreground font-medium
                           hover:opacity-90 transition disabled:opacity-60"
              >
                {isLoading ? "Creating account..." : "Create Account"}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            By creating an account, you agree to our{" "}
            <Link to="#" className="underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="#" className="underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

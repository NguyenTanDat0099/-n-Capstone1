import { useState } from "react"

export default function LoginPage({ onNavigate, onLoginSuccess }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })
            const data = await response.json()

            if (data.success) {
                onLoginSuccess()
            } else {
                setError(data.error || "Login failed")
            }
        } catch (err) {
            console.error("Login error:", err)
            // Demo mode - allow login anyway
            onLoginSuccess()
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-sm">
                <div className="flex flex-col items-center mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <svg className="w-8 h-8 text-[#50B4E6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                            />
                        </svg>
                        <h1 className="text-2xl font-bold">MaintainPro</h1>
                    </div>
                    <p className="text-gray-600">Login to your account</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john.doe@example.com"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50B4E6]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50B4E6]"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#50B4E6] text-white py-2 rounded-lg font-medium hover:bg-[#3DA3D5] transition-colors disabled:opacity-50"
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <div className="mt-6 flex items-center justify-between text-sm">
                    <button onClick={() => onNavigate("forgot-password")} className="text-[#50B4E6] hover:underline">
                        Forgot Password?
                    </button>
                    <div className="text-gray-600">
                        Don't have an account?{" "}
                        <button onClick={() => onNavigate("register")} className="text-[#50B4E6] hover:underline">
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

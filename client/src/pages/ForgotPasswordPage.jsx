import { useState } from "react"

export default function ForgotPasswordPage({ onNavigate }) {
    const [email, setEmail] = useState("")

    const handleSubmit = (e) => {
        e.preventDefault()
        alert("Password reset link sent to your email!")
        onNavigate("login")
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-sm">
                <div className="flex flex-col items-center mb-8">
                    <h1 className="text-2xl font-bold mb-2">Reset your password</h1>
                    <p className="text-gray-600 text-center">
                        Enter the email address you registered with and we'll send you instructions to reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50B4E6]"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#50B4E6] text-white py-2 rounded-lg font-medium hover:bg-[#3DA3D5] transition-colors"
                    >
                        Send link
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button onClick={() => onNavigate("login")} className="text-[#50B4E6] hover:underline text-sm">
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    )
}

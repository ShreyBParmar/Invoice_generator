import {useState} from 'react'
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff,GraduationCap } from "lucide-react";
import { checkTokenStatus, displayTokenStatus } from '../utils/tokenDebug';

const SignUp = ({nextStep}) => {
    const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""})

    const navigate = useNavigate();

   const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

   const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

   const handleSubmit = async(e) => {
      e.preventDefault()
      
      try {
        if(formData.password !== formData.confirmPassword){
          alert("Passwords do not match");
          return;
        }

        const response = await fetch(
            "http://localhost:3000/api/auth/signup",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            }
        );

        const data = await response.json();
        console.log("Response:", response);
        console.log("Response data:", data);

        if(response.ok){
          console.log("Token from response:", data.token);
          
          if(data.token) {
            localStorage.setItem("token", data.token);
            console.log("✅ Token set in localStorage");
            
            // VERIFY TOKEN WAS STORED
            const status = displayTokenStatus();
            
            if(status.exists) {
              console.log("✅ TOKEN VERIFICATION SUCCESSFUL!");
              console.log("user created successfully");
              nextStep();
            } else {
              console.error("❌ TOKEN STORAGE FAILED!");
              alert("Error: Token was not stored in localStorage");
            }
          } else {
            console.error("No token in response");
            alert("Error: No token received from server");
          }
        }
        else{
          console.log("Signup failed:", data);
          alert("Signup failed: " + (data.message || "Unknown error"));
        }
        
    } catch (error) {
        console.log("Signup error:", error);
        alert("Error during signup: " + error.message);
    }
   }

  return (
    <div>
        <div className='bg-white text-black p-10 w-[400px] mx-auto'>
            <form onSubmit={handleSubmit}>
                <label className="text-3xl mb-8 flex justify-center">Sign Up </label>

                <input
                    type="email"
                    name='email'
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="border p-2 w-full mb-4 focus:placeholder-transparent"
                    required
                />

                <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                    name='password'
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="border p-2 w-full mb-4 focus:placeholder-transparent"
                    required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                </div>

                <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  className="border p-2 rounded w-full pr-10 focus:placeholder-transparent mb-4 focus:placeholder-transparent"
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 "
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

                <button
                    type='submit'
                    className="bg-black text-white px-5 py-2"
                >
                    Next
                </button>
                <span
                  onClick={() => navigate("/business")}
                  className="text-blue-500 cursor-pointer"
                >
                  Login
                </span>
            </form>
        </div>
    </div>
  )
}

export default SignUp
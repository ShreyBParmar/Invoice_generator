import { useState} from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getApiUrl } from "../utils/api";

const Business = ({nextStep}) => {
  const navigate = useNavigate(); 

  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const token =
localStorage.getItem("token");

  const [formData, setFormData] = useState({
    business_name: "",
    is_individual: isChecked,
    vanity_url: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();

    if (isLoading) return;
    setIsLoading(true);

    try{
      const token =
localStorage.getItem("token");

console.log(token);

      const res = await fetch(getApiUrl('/api/auth/business'),{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
           Authorization:`Bearer ${token}`
        },
         body: JSON.stringify(formData)
      })

      const data= await res.json()

      if(res.ok){
        console.log("Business created");
        navigate("/dashboard");
      }
      else{
         console.log("Error");
      }
    } catch(error){
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className='bg-white text-black p-10 w-[400px] mx-auto'>

        <form onSubmit={handleSubmit}>

          <label className="text-3xl mb-8 flex justify-center">
            Set up your business
          </label>

          {/* Business Name */}

          <input
            type="text"
            name='business_name'
            placeholder="Business name"
            value={formData.business_name}
            onChange={handleChange}
            disabled={isChecked}
            className={`border p-2 w-full mb-4 focus:placeholder-transparent
              ${isChecked ? "bg-gray-200 cursor-not-allowed" : ""}
            `}
            required={!isChecked}
          />

          {/* Checkbox */}

          <label className="flex items-center gap-2 mb-4">

            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => setIsChecked(!isChecked)}
            />

            I'm an individual

          </label>

          {/* Vanity URL */}

          <div className="mb-4">

          <label className="font-semibold block mb-2">
            Vanity URL *
          </label>

          <div className="flex">

            <input
              type="text"
              name="vanity_url"
              placeholder="business"
              value={formData.vanity_url}
              onChange={handleChange}
              className="border border-gray-300 p-2 w-full rounded-l"
              required
            />

            <span
              className="bg-gray-200 border border-l-0 border-gray-300 px-4 flex items-center rounded-r text-gray-700"
            >
              .invoicely.com
            </span>

          </div>

        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="
        bg-black
        text-white
          px-8
          py-3
          rounded-md
          hover:opacity-90
          disabled:cursor-not-allowed
          disabled:opacity-70
          transition
          "
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              Setting up...
            </span>
          ) : (
            "Start"
          )}
        </button>
        </form>

      </div>
    </div>
  );
};

export default Business;
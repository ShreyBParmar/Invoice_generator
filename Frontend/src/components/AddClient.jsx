import { useState, useEffect, useRef } from "react";

import {
  User,
  Building2,
  Save,
  ArrowLeft,
  Check,
  ChevronDown,
  Search,
} from "lucide-react";

const AddClient = ({ setActivePage }) => {

  // =========================
  // INITIAL FORM
  // =========================

  const initialFormData = {

  organizationName:"",

  firstname:"",
  lastname:"",

  email:"",
  website:"",

  currency:"",
  language:"English (US)",

  address1:"",
  address2:"",

  postalcode:"",
  state:"",
  city:"",
  country:"",

  phone_number:"",
  fax_number:"",
  tax_id:""
};

  // =========================
  // STATES
  // =========================

  const [clientType, setClientType] =
    useState("individual");

  const [loading, setLoading] =
    useState(false);

  // Countries
  const [countries, setCountries] =
    useState([]);

  // Currency
  const [currencies, setCurrencies] = useState([]);

  const [selectedCurrency, setSelectedCurrency] = useState("");

  // =========================
  // FORM DATA
  // =========================

  const [formData, setFormData] =
    useState(initialFormData);

  // =========================
  // HANDLE CHANGE
  // =========================

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
      e.target.value
    });
  };

  const handleClientTypeChange =
(type)=>{

  setClientType(type);

  setFormData(
    initialFormData
  );

  setSelectedCurrency("");

};

  // =========================
  // FETCH COUNTRIES
  // =========================

  const fetchCountries = async () => {

    if (countries.length > 0) return;

    try {

        const response = await fetch(
            "https://restcountries.com/v3.1/all?fields=name,cca3"
        );

        const data = await response.json();

        console.log(data);

        const sortedCountries = data.sort((a, b) =>
            a.name.common.localeCompare(b.name.common)
        );

        setCountries(sortedCountries);

    } catch (error) {
        console.log(error);
    }
};
  
  // =========================
  // FETCH CURRENCIES
  // =========================
  const fetchCurrencies =
  async () => {

    try {

      const res =
      await fetch(
      "https://openexchangerates.org/api/currencies.json"
      );

      const data =
      await res.json();

      const currencyArray =
      Object.entries(data).map(

      ([code, name]) => ({

        code,
        name

      })

      );

      currencyArray.sort(
      (a,b)=>

      a.code.localeCompare(b.code)

      );

      setCurrencies(
      currencyArray
      );

    }

    catch(error){

      console.log(
      error
      );

    }

  };
  
  // =========================
  // CLICK OUTSIDE
  // =========================

  useEffect(() => {
    fetchCurrencies();
  }, []);

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

   try{
      console.log("All localStorage items:", localStorage);
      
      const token =
localStorage.getItem("token");

console.log(
"TOKEN from localStorage:",
token
);

if(!token) {
  alert("❌ No authentication token found!\n\nPlease sign up again and make sure you see 'user created successfully' message.");
  console.log("Available localStorage keys:", Object.keys(localStorage));
  setLoading(false);
  return;
}

console.log(
"Sending token:",
token
);

console.log(
"Header value:",
`Bearer ${token}`
);

const payload = {
  ...formData,
  clientType
};

console.log("Payload:", payload);

const res =
await fetch(
"/api/addclient",
{
 method:"POST",

 headers:{
   "Content-Type":
   "application/json",

   Authorization:
   `Bearer ${token}`
 },

 body:
 JSON.stringify(payload)
})

            let data;
            try {
              const responseText = await res.text();
              console.log('Response Text:', responseText);
              data = responseText ? JSON.parse(responseText) : {};
            } catch (parseError) {
              console.error('JSON Parse Error:', parseError);
              throw new Error(`Server response invalid: ${parseError.message}`);
            }

            if(res.ok){
              console.log("Client data saved");
              setActivePage("dashboard");
              setFormData(initialFormData);
              setClientType("individual");
            }

            else{
                console.log("Error:", data);
                alert("Failed to add client: " + (data.message || "Unknown error"));
            }
        }
        catch(error){
            console.log("Error:", error);
            alert("Error: " + error.message);
        } finally {
          setLoading(false);
        }
       
    };

  return (

    <div className="text-white">

      {/* HEADER */}
      <div className="
        flex
        justify-between
        items-center
        mb-10
      ">

        <div className="
          flex
          items-center
          gap-5
        ">

          {/* BACK */}
          <button
            type="button"

            onClick={() =>
              setActivePage(
                "dashboard"
              )
            }

            className="
              bg-white/10
              border
              border-white/10
              p-3
              rounded-2xl
              hover:bg-white/20
              transition-all
            "
          >
            <ArrowLeft size={20} />
          </button>

          <h1 className="
            text-5xl
            font-bold
          ">
            New Client
          </h1>

        </div>

        {/* SAVE */}
        <button
          onClick={handleSubmit}

          className="
            bg-gradient-to-r
            from-orange-500
            to-orange-600
            px-8
            py-4
            rounded-2xl
            hover:scale-105
            transition-all
            duration-300
            flex
            items-center
            gap-2
          "
        >

          <Save size={18} />

          {
            loading
            ? "Saving..."
            : "Save Client"
          }

        </button>

      </div>

      {/* FORM */}
      <form className="space-y-8">

        {/* BASIC INFO */}
        <div className="
          bg-white/10
          backdrop-blur-xl
          border
          border-white/10
          rounded-3xl
          overflow-hidden
          shadow-2xl
        ">

          {/* TITLE */}
          <div className="
            px-8
            py-5
            border-b
            border-white/10
          ">

            <h2 className="
              text-2xl
              font-semibold
            ">
              Basic Information
            </h2>

          </div>

          <div className="p-8">

            {/* TYPE */}
            <div className="
              flex
              gap-4
              mb-10
            ">

              {/* INDIVIDUAL */}
              <button
                type="button"

               onClick={() => handleClientTypeChange("individual")}

                className={`
                  flex
                  items-center
                  justify-between
                  w-[280px]
                  px-6
                  py-4
                  rounded-2xl
                  border
                  transition-all
                  duration-300

                  ${
                    clientType ===
                    "individual"

                    ? "bg-gradient-to-r from-blue-500 to-purple-500 border-transparent"

                    : "bg-white/5 border-white/10 hover:bg-white/10"
                  }
                `}
              >

                <div className="
                  flex
                  items-center
                  gap-3
                ">

                  <User size={20} />

                  Individual

                </div>

                {
                  clientType ===
                  "individual" && (
                    <Check size={18} />
                  )
                }

              </button>

              {/* ORGANIZATION */}
              <button
                type="button"

               onClick={() => handleClientTypeChange("organization")}

                className={`
                  flex
                  items-center
                  justify-between
                  w-[280px]
                  px-6
                  py-4
                  rounded-2xl
                  border
                  transition-all
                  duration-300

                  ${
                    clientType ===
                    "organization"

                    ? "bg-gradient-to-r from-blue-500 to-purple-500 border-transparent"

                    : "bg-white/5 border-white/10 hover:bg-white/10"
                  }
                `}
              >

                <div className="
                  flex
                  items-center
                  gap-3
                ">

                  <Building2 size={20} />

                  Organization

                </div>

                {
                  clientType ===
                  "organization" && (
                    <Check size={18} />
                  )
                }

              </button>

            </div>

            {/* ORG FIELD */}
            {
              clientType ===
              "organization" && (

                <div className="mb-6">

                  <input
                    type="text"
                    name="organizationName"
                    placeholder="Organization Name"
                    value={
                      formData.organizationName
                    }
                    onChange={handleChange}
                    className="input-style"
                  />

                </div>
              )
            }

            {/* GRID */}
            <div className="
              grid
              grid-cols-2
              gap-6
            ">

              <input
                type="text"
                name="firstname"

                placeholder={
                  clientType ===
                  "organization"

                  ? "Contact First Name"

                  : "First Name"
                }

                value={formData.firstname}

                onChange={handleChange}

                className="input-style"
              />

              <input
                type="text"
                name="lastname"

                placeholder={
                  clientType ===
                  "organization"

                  ? "Contact Last Name"

                  : "Last Name"
                }

                value={formData.lastname}

                onChange={handleChange}

                className="input-style"
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="input-style"
              />

              <input
                type="text"
                name="website"
                placeholder="Website URL"
                value={formData.website}
                onChange={handleChange}
                className="input-style"
              />

              {/* CURRENCY */}
              <div
                className="relative">
              <select
                value={formData.currency}
                onChange={(e)=>{ setFormData({...formData, currency:e.target.value }) }}
                className="input-style"     
              >

              <option value="" className="bg-[#1e293b] text-white">
                  Select Currency
              </option>

              {
                currencies.map(
                  currency => (
                <option
                  key={
                    currency.code
                  }
                  value={
                    currency.code
                  }
                  className="bg-[#1e293b] text-white"
                >

                { currency.code }

                {" - "}
                
                {currency.name}

              </option>
              ) 
              )}
      </select>

              </div>

              {/* LANGUAGE */}
              <label className="input-style">English (US)</label>

            </div>

          </div>

        </div>

        {/* ADDRESS */}
        <div className="
          bg-white/10
          backdrop-blur-xl
          border
          border-white/10
          rounded-3xl
          overflow-hidden
        ">

          <div className="
            px-8
            py-5
            border-b
            border-white/10
          ">

            <h2 className="
              text-2xl
              font-semibold
            ">
              Address
            </h2>

          </div>

          <div className="
            p-8
            grid
            grid-cols-2
            gap-6
          ">

            <input
              type="text"
              name="address1"
              placeholder="Address Line 1"
              value={formData.address1}
              onChange={handleChange}
              className="input-style"
            />

            <input
              type="text"
              name="postalcode"
              placeholder="Postal Code"
              value={formData.postalcode}
              onChange={handleChange}
              className="input-style"
            />

            <input
              type="text"
              name="address2"
              placeholder="Address Line 2"
              value={formData.address2}
              onChange={handleChange}
              className="input-style"
            />

            <input
              type="text"
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
              className="input-style"
            />

            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              className="input-style"
            />

            {/* COUNTRY */}
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              onFocus={fetchCountries}
              className="input-style"
              required
            >

            <option
                value=""
                className="bg-[#1e293b] text-white"
            >
                Select Country
            </option>

            {countries.map((country) => (

                <option
                    key={country.cca3}
                    value={country.name.common}
                    className="
                        bg-[#1e293b]
                        text-white
                    "
                >
                    {country.name.common}
                </option>

            ))}

        </select>

          </div>

        </div>
        <div className="
          bg-white/10
          backdrop-blur-xl
          border
          border-white/10
          rounded-3xl
          overflow-hidden
        ">

          <div className="
            px-8
            py-5
            border-b
            border-white/10
          ">

            <h2 className="
              text-2xl
              font-semibold
            ">
              Additional Information
            </h2>

          </div>

          <div className="
            p-8
            grid
            grid-cols-2
            gap-6
          ">

            <input
              type="text"
              name="phone_number"
              placeholder="Phone number"
              value={formData.phone_number}
              onChange={handleChange}
              className="input-style"
            />

            <input
              type="text"
              name="fax_number"
              placeholder="Fax number"
              value={formData.fax_number}
              onChange={handleChange}
              className="input-style"
            />

            <input
              type="text"
              name="tax_id"
              placeholder="Tax identification"
              value={formData.tax_id}
              onChange={handleChange}
              className="input-style"
            />
            </div></div>

      </form>

    </div>
  );
};

export default AddClient;
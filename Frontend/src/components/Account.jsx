import { useState, useRef, useEffect, useMemo } from 'react'
import { Loader2, ChevronDown, Search, Check } from 'lucide-react';
import { getApiUrl } from '../utils/api';

// Static country list — no external API call, no exposed key needed.
const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina",
  "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain",
  "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin",
  "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil",
  "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon",
  "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile",
  "China", "Colombia", "Comoros", "Congo", "Congo (DRC)", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica",
  "Dominican Republic", "Ecuador", "Egypt", "El Salvador",
  "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji",
  "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana",
  "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran",
  "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos",
  "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
  "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia",
  "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania",
  "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia",
  "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru",
  "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria",
  "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau",
  "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
  "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino",
  "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia",
  "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
  "Solomon Islands", "Somalia", "South Africa", "South Korea",
  "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden",
  "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand",
  "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia",
  "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
  "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen", "Zambia", "Zimbabwe",
];

// Searchable country dropdown, styled to match this form's inputs.
const CountrySelect = ({ value, onChange, name = "country" }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const rootRef = useRef(null);
  const inputRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => c.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setActiveIndex(0);
    }
  }, [open]);

  function commit(country) {
    onChange(country);
    setOpen(false);
    setQuery("");
  }

  function handleKeyDown(e) {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[activeIndex]) commit(filtered[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <div ref={rootRef} className="relative w-full">
      {/* Hidden field so `required` + normal form semantics still work */}
      <input type="hidden" name={name} value={value} required readOnly />

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        className="
          border
          p-3
          w-full
          rounded-md
          flex
          items-center
          justify-between
          gap-2
          text-left
          focus:outline-none
          focus:ring-2
          focus:ring-black
        "
      >
        <span className={value ? "truncate" : "truncate text-gray-400"}>
          {value || "Select Country"}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-20 bottom-full mb-1.5 w-full overflow-hidden rounded-md border bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Search size={15} className="shrink-0 text-gray-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search countries..."
              className="w-full text-sm focus:outline-none"
            />
          </div>

          <ul role="listbox" className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3.5 py-2.5 text-sm text-gray-400">No matches</li>
            )}
            {filtered.map((c, i) => (
              <li
                key={c}
                role="option"
                aria-selected={c === value}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => commit(c)}
                className={`flex cursor-pointer items-center justify-between gap-2 px-3.5 py-2 text-sm ${
                  i === activeIndex ? "bg-gray-100" : ""
                }`}
              >
                <span className="truncate">{c}</span>
                {c === value && <Check size={15} className="shrink-0 text-gray-500" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const Account = ({ nextStep }) => {

    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        companyname: "",
        address: "",
        website: "",
        postalcode: "",
        state: "",
        taxid: "",
        city: "",
        country: ""
    });

    const [isLoading, setIsLoading] = useState(false);

    // Handle Input Changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handle Country Selection
    const handleCountryChange = (country) => {
        setFormData((prev) => ({
            ...prev,
            country
        }));
    };

    // Form Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isLoading) return;
        setIsLoading(true);

        try{
            const res = await fetch(getApiUrl('/api/auth/account'),{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            })

            const data= await res.json()

            if(res.ok){
                console.log("Account created");
                nextStep()
            }

            else{
                console.log("Error");
            }
        }
        catch(error){
            console.log(error);
        }
        finally {
            setIsLoading(false);
        }

        console.log(formData);

        nextStep();
    };

    return (
        <div className="mt-20">

            <div className='bg-white text-black p-10 w-full max-w-5xl mx-auto rounded-xl shadow-lg'>

                <form onSubmit={handleSubmit}>

                    <label className="text-3xl mb-8 flex justify-center font-semibold">
                        Tell us about you
                    </label>

                    {/* Row 1 */}
                    <div className='flex gap-4 mb-4'>

                        <input
                            type="text"
                            name='firstname'
                            placeholder="First name"
                            value={formData.firstname}
                            onChange={handleChange}
                            className="
                                border
                                p-3
                                w-full
                                rounded-md
                                focus:outline-none
                                focus:ring-2
                                focus:ring-black
                                focus:placeholder-transparent
                            "
                            required
                        />

                        <input
                            type="text"
                            name='lastname'
                            placeholder="Last name"
                            value={formData.lastname}
                            onChange={handleChange}
                            className="
                                border
                                p-3
                                w-full
                                rounded-md
                                focus:outline-none
                                focus:ring-2
                                focus:ring-black
                                focus:placeholder-transparent
                            "
                            required
                        />

                        <input
                            type="text"
                            name='companyname'
                            placeholder="Company name"
                            value={formData.companyname}
                            onChange={handleChange}
                            className="
                                border
                                p-3
                                w-full
                                rounded-md
                                focus:outline-none
                                focus:ring-2
                                focus:ring-black
                                focus:placeholder-transparent
                            "
                        />

                    </div>

                    {/* Row 2 */}
                    <div className='flex gap-4 mb-4'>

                        <input
                            type='text'
                            name='address'
                            placeholder='Address'
                            value={formData.address}
                            onChange={handleChange}
                            className="
                                border
                                p-3
                                w-full
                                rounded-md
                                focus:outline-none
                                focus:ring-2
                                focus:ring-black
                                focus:placeholder-transparent
                            "
                            required
                        />

                        <input
                            type='text'
                            name='website'
                            placeholder='Website URL'
                            value={formData.website}
                            onChange={handleChange}
                            className="
                                border
                                p-3
                                w-full
                                rounded-md
                                focus:outline-none
                                focus:ring-2
                                focus:ring-black
                                focus:placeholder-transparent
                            "
                        />

                    </div>

                    {/* Row 3 */}
                    <div className='flex gap-4 mb-4'>

                        <input
                            type='text'
                            name='postalcode'
                            placeholder='Postal code'
                            value={formData.postalcode}
                            onChange={handleChange}
                            className="
                                border
                                p-3
                                w-full
                                rounded-md
                                focus:outline-none
                                focus:ring-2
                                focus:ring-black
                                focus:placeholder-transparent
                            "
                            required
                        />

                        <input
                            type='text'
                            name='state'
                            placeholder='State'
                            value={formData.state}
                            onChange={handleChange}
                            className="
                                border
                                p-3
                                w-full
                                rounded-md
                                focus:outline-none
                                focus:ring-2
                                focus:ring-black
                                focus:placeholder-transparent
                            "
                        />

                        <input
                            type='text'
                            name='taxid'
                            placeholder='Tax ID'
                            value={formData.taxid}
                            onChange={handleChange}
                            className="
                                border
                                p-3
                                w-full
                                rounded-md
                                focus:outline-none
                                focus:ring-2
                                focus:ring-black
                                focus:placeholder-transparent
                            "
                        />

                    </div>

                    {/* Row 4 */}
                    <div className='flex gap-4 mb-6'>

                        <input
                            type='text'
                            name='city'
                            placeholder='City'
                            value={formData.city}
                            onChange={handleChange}
                            className="
                                border
                                p-3
                                w-full
                                rounded-md
                                focus:outline-none
                                focus:ring-2
                                focus:ring-black
                                focus:placeholder-transparent
                            "
                            required
                        />

                        <CountrySelect
                            name="country"
                            value={formData.country}
                            onChange={handleCountryChange}
                        />

                    </div>

                    {/* Button */}
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
                                Saving...
                            </span>
                        ) : (
                            "Next"
                        )}
                    </button>

                </form>

            </div>

        </div>
    )
}

export default Account

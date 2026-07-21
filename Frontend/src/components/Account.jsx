import { useState } from 'react'
import { getApiUrl } from '../utils/api';

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

    const [countries, setCountries] = useState([]);

    // Handle Input Changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Fetch Countries
    const fetchCountries = async () => {

    if (countries.length > 0) return;

    try {

        const response = await fetch(
  'https://api.restcountries.com/countries/v5/all',
  { headers: { 'Authorization': 'Bearer rc_live_ff7f3ea205fc4ee9a48c43673ebcbcbc' } }
)
    

        const data = await response.json();

        console.log("Data: ",data);

        setCountries(sortedCountries);

    } catch (error) {
        console.log(error);
    }
};

    // Form Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

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

                        <select
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            onFocus={fetchCountries}
                            className="
                                border
                                p-3
                                w-full
                                rounded-md
                                focus:outline-none
                                focus:ring-2
                                focus:ring-black
                            "
                            required
                        >

                            <option value="">
                                Select Country
                            </option>

                            {countries.map((country) => (
                                <option
                                    key={country.cca3}
                                    value={country.name.common}
                                >
                                    {country.name.common}
                                </option>
                            ))}

                        </select>

                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        className="
                            bg-black
                            text-white
                            px-8
                            py-3
                            rounded-md
                            hover:opacity-90
                            transition
                        "
                    >
                        Next
                    </button>

                </form>

            </div>

        </div>
    )
}

export default Account
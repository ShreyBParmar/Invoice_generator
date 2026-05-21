import React, { useState } from 'react'
import SignUp from '../components/SignUp'
import Account from '../components/Account'
import Business from '../components/Business'

const HomePage = () => {

    const [activeStep, setActiveStep] = useState(1);
    
  return (
    <div className='min-h-screen bg-[#3b3f57]'>

  <h1 className='text-white flex justify-center items-center text-5xl pt-10'>
    Invoice generator
  </h1>

  {/* Stepper Section */}
  <div className="relative flex justify-center items-center mt-10">

    {/* Line */}
    <div className="absolute h-[2px] w-[400px] bg-gray-400"></div>

    {/* Buttons */}
    <div className="flex gap-10 z-10">

      <button
        disabled={activeStep !== 1}
        className={`px-8 py-3 border
          ${activeStep === 1
            ? "bg-white text-black"
            : "bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
      >
        SIGN UP
      </button>

      <button
        disabled={activeStep !== 2}
        className={`px-8 py-3 border
          ${activeStep === 2
            ? "bg-white text-black"
            : "bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
      >
        ACCOUNT
      </button>

      <button
        disabled={activeStep !== 3}
        className={`px-8 py-3 border
          ${activeStep === 3
            ? "bg-white text-black"
            : "bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
      >
        BUSINESS
      </button>

    </div>
  </div>

  {/* Forms Section */}
  <div className="mt-20">

    {activeStep === 1 && <SignUp nextStep={() => setActiveStep(2)}/>}

    {activeStep === 2 && <Account nextStep={() => setActiveStep(3)}/>}

    {activeStep === 3 && <Business nextStep={() => setActiveStep(4)}/>}

  </div>

</div>
  )
}

export default HomePage
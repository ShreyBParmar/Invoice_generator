import { useState, useRef, useEffect } from "react";

import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
} from "lucide-react";

const CreateInvoice = ({
  setActivePage
}) => {

  // =========================
  // STATES
  // =========================

  const [loading, setLoading] =
    useState(false);

  const [currencies, setCurrencies] = useState([]);

  const fileInputRef = useRef(null);

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [showTaxDropdown,
setShowTaxDropdown] =
useState(false);

const [taxName,setTaxName] =
useState("");

const [taxRate,setTaxRate] =
useState("");

const [taxAmount,
setTaxAmount] =
useState(0);

const [taxConfigured,
setTaxConfigured] =
useState(false);

const [showDiscountDropdown,
setShowDiscountDropdown] =
useState(false);

const [discountName,
setDiscountName] =
useState("");

const [discountAmount,
setDiscountAmount] =
useState(0);

const [discountConfigured,
setDiscountConfigured] =
useState(false);

  const [invoiceData,
    setInvoiceData] =
    useState({

      title: "Invoice",

      description: "",

      invoiceNumber: "INV-1",

      language: "English (US)",

      currency: "USD",

      clientName: "",

      purchaseOrder: "",

      invoiceDate: "",

      dueDate: "",

      notes: "",

      discountPercent: 0,
discountPrice: 0,});

  // =========================
  // ITEMS
  // =========================

  const [items, setItems] =
    useState([
      {
        description: "",
        quantity: 1,
        rate: 0,
        amount: 0,
      },
  ]);

  // =========================
  // FETCH CURRENCIES
  // =========================
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await fetch(
          "https://openexchangerates.org/api/currencies.json"
        );
        const data = await res.json();
        const currencyArray = Object.entries(data).map(([code, name]) => ({
          code,
          name,
        }));
        currencyArray.sort((a, b) => a.code.localeCompare(b.code));
        setCurrencies(currencyArray);
      } catch (error) {
        console.log("Error fetching currencies:", error);
      }
    };
    fetchCurrencies();
  }, []);

  // =========================
  // HANDLE LOGO UPLOAD
  // =========================

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      setLogoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoButtonClick = () => {
    fileInputRef.current?.click();
  };

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (e) => {

    setInvoiceData({
      ...invoiceData,

      [e.target.name]:
      e.target.value
    });
  };

  // =========================
  // HANDLE ITEM CHANGE
  // =========================

  const handleItemChange =
    (index, field, value) => {

    const updatedItems =
      [...items];

    updatedItems[index][field] =
      value;

    // Amount Calculation
    updatedItems[index].amount =

      updatedItems[index]
      .quantity *

      updatedItems[index]
      .rate;

    setItems(updatedItems);
  };

  // =========================
  // ADD ITEM
  // =========================

  const addItem = () => {

    setItems([
      ...items,

      {
        description: "",
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ]);
  };

  // =========================
  // REMOVE ITEM
  // =========================

  const removeItem = (index) => {

    const updatedItems =
      items.filter(
        (_, i) => i !== index
      );

    setItems(updatedItems);
  };

  // =========================
  // CALCULATIONS
  // =========================

  const subtotal =
items.reduce(

(total,item)=>

total +
Number(item.amount),

0
);

const taxTotal = Number(taxAmount) || 0;

const discountTotal = Number(discountAmount) || 0;

const finalTotal =

subtotal +
taxTotal -
discountTotal;

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async () => {

    try {

      setLoading(true);

      // Validate required fields
      if (!invoiceData.clientName.trim()) {
        alert("Please enter client name");
        return;
      }

      if (!invoiceData.invoiceDate) {
        alert("Please select invoice date");
        return;
      }

      if (!invoiceData.invoiceNumber.trim()) {
        alert("Please enter invoice number");
        return;
      }

      if (!invoiceData.dueDate) {
        alert("Please select a due date");
        return;
      }

      if (items.length === 0 || !items[0].description.trim()) {
        alert("Please add at least one invoice item");
        return;
      }

      // Create FormData to handle both files and JSON data
      const formData = new FormData();

      // Add logo file if selected
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      // Add invoice data as JSON
      const invoicePayload = {
        ...invoiceData,
        items,
        subtotal,
        taxAmount: taxTotal,
        discountAmount: discountTotal,
        finalTotal,
        taxName: taxConfigured ? taxName : null,
        discountName: discountConfigured ? discountName : null,
      };

      formData.append('invoiceData', JSON.stringify(invoicePayload));

      console.log('Submitting Invoice:', invoicePayload);
      console.log('Logo File:', logoFile);

      // API CALL - Create Invoice
      const token = localStorage.getItem('token'); // Get token from localStorage
      const response = await fetch('/api/invoices', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Response Status:', response.status);
      console.log('Response Headers:', response.headers);

      let result;
      try {
        const responseText = await response.text();
        console.log('Response Text:', responseText);
        result = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        throw new Error(`Server response invalid: ${parseError.message}`);
      }

      if (!response.ok) {
        console.error('Error Response:', result);
        const errorMessage = result.error || result.message || `Server error: ${response.status}`;
        throw new Error(errorMessage);
      }

      alert('Invoice saved successfully!');
      console.log('Invoice created:', result.data);
      
      // Reset form or navigate back
      setActivePage('dashboard');

    } catch(error) {

      console.error('Error Details:', error);
      alert('Error saving invoice: ' + error.message);

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

        {/* LEFT */}
        <div className="
          flex
          items-center
          gap-5
        ">

          <button
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
            New Invoice
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
            : "Save Invoice"
          }

        </button>

      </div>

      {/* FORM */}
      <div className="space-y-8">

        {/* HEADER CARD */}
        <div className="
          bg-white/10
          backdrop-blur-xl
          border
          border-white/10
          rounded-3xl
          p-8
          shadow-2xl
        ">

          <div className="
            grid
            grid-cols-2
            gap-10
          ">

            {/* LEFT */}
            <div className="space-y-6">

              <input
                type="text"
                name="title"
                value={invoiceData.title}
                onChange={handleChange}
                className="
                  text-5xl
                  font-bold
                  bg-transparent
                  border-none
                  outline-none
                "
              />

              <textarea
                name="description"
                placeholder="
                  Add Description...
                "

                value={
                  invoiceData.description
                }

                onChange={handleChange}

                rows="4"

                className="
                  input-style
                  resize-none
                "
              />

              <div className="
                grid
                grid-cols-2
                gap-6
              ">

                <div>

                  <label className="
                    block
                    mb-3
                    text-slate-300
                  ">
                    Invoice Number
                  </label>

                  <input
                    type="text"
                    name="invoiceNumber"
                    value={
                      invoiceData.invoiceNumber
                    }
                    onChange={handleChange}
                    className="input-style"
                  />

                </div>

                <div>

                  <label className="
                    block
                    mb-3
                    text-slate-300
                  ">
                    Language
                  </label>

                  <select
                    name="language"
                    value={
                      invoiceData.language
                    }
                    onChange={handleChange}
                    className="input-style"
                  >

                    <option>
                      English (US)
                    </option>

                    <option>
                      Hindi
                    </option>

                  </select>

                </div>

              </div>

            </div>

            {/* RIGHT */}
            <div className="
              flex
              flex-col
              items-end
              gap-6
            ">

              {/* LOGO */}
              <button 
                onClick={handleLogoButtonClick}
                className="
                  w-[150px]
                  h-[150px]
                  rounded-full
                  bg-gradient-to-br
                  from-blue-500
                  to-purple-500
                  flex
                  items-center
                  justify-center
                  text-center
                  text-xl
                  font-bold
                  mr-40
                  hover:cursor-pointer
                  hover:scale-110
                  active:scale-95
                  transition-all
                  overflow-hidden
                  border-2
                  border-white/20
                "
              >
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Logo" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  'YOUR LOGO'
                )}
              </button>

              {/* HIDDEN FILE INPUT */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                style={{ display: 'none' }}
              />

              {/* CURRENCY */}
              <div className="w-full mt-18">

                <label className="
                  block
                  mb-3
                  text-slate-300
                ">  
                  Currency
                </label>

                <select
                  name="currency"
                  value={
                    invoiceData.currency
                  }
                  onChange={handleChange}
                  className="input-style"
                >
                  <option value="" className="bg-[#1e293b] text-white">
                    Select Currency
                  </option>
                  {currencies.map(
                    (currency) => (
                      <option
                        key={currency.code}
                        value={currency.code}
                        className="bg-[#1e293b] text-white"
                      >
                        {currency.code} - {currency.name}
                      </option>
                    )
                  )}
                </select>

              </div>

            </div>

          </div>

        </div>

        {/* CLIENT CARD */}
        <div className="
          bg-white/10
          backdrop-blur-xl
          border
          border-white/10
          rounded-3xl
          p-8
          shadow-2xl
        ">

          <div className="
            grid
            grid-cols-2
            gap-10
          ">

            {/* LEFT */}
            <div className="space-y-6">

              <div>

                <label className="
                  block
                  mb-3
                  text-slate-300
                ">
                  Client Name
                </label>

                <input
                  type="text"
                  name="clientName"
                  placeholder="
                    Enter Client Name
                  "

                  value={
                    invoiceData.clientName
                  }

                  onChange={handleChange}

                  className="input-style"
                />

              </div>

            </div>

            {/* RIGHT */}
            <div className="
              grid
              grid-cols-2
              gap-6
            ">

              <div>

                <label className="
                  block
                  mb-3
                  text-slate-300
                ">
                  Invoice Date
                </label>

                <input
                  type="date"
                  name="invoiceDate"
                  value={
                    invoiceData.invoiceDate
                  }
                  onChange={handleChange}
                  className="input-style"
                />

              </div>

              <div>

                <label className="
                  block
                  mb-3
                  text-slate-300
                ">
                  Due Date
                </label>

                <input
                  type="date"
                  name="dueDate"
                  value={
                    invoiceData.dueDate
                  }
                  onChange={handleChange}
                  className="input-style"
                />

              </div>

              <div className="
                col-span-2
              ">

                <label className="
                  block
                  mb-3
                  text-slate-300
                ">
                  Purchase Order
                </label>

                <input
                  type="text"
                  name="purchaseOrder"
                  value={
                    invoiceData.purchaseOrder
                  }
                  onChange={handleChange}
                  className="input-style"
                />

              </div>

            </div>

          </div>

        </div>

        {/* ITEMS CARD */}
        <div className="
          bg-white/10
          backdrop-blur-xl
          border
          border-white/10
          rounded-3xl
          p-8
          shadow-2xl
        ">

          {/* HEADERS */}
          <div className="
            grid
            grid-cols-12
            gap-4
            mb-6
            text-slate-300
            font-semibold
          ">

            <div className="
              col-span-6
            ">
              Description
            </div>

            <div className="
              col-span-2
            ">
              Qty
            </div>

            <div className="
              col-span-2
            ">
              Rate
            </div>

            <div className="
              col-span-2
            ">
              Amount
            </div>

          </div>

          {/* ITEMS */}
          <div className="
            space-y-6
          ">

            {
              items.map(
                (item, index) => (

                <div
                  key={index}

                  className="
                    grid
                    grid-cols-12
                    gap-4
                    items-center
                  "
                >

                  {/* DESCRIPTION */}
                  <textarea
                    rows="3"

                    placeholder="
                      Item Description
                    "

                    value={
                      item.description
                    }

                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "description",
                        e.target.value
                      )
                    }

                    className="
                      input-style
                      col-span-6
                      resize-none
                    "
                  />

                  {/* QUANTITY */}
                  <input
                    type="number"

                    value={
                      item.quantity
                    }

                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "quantity",
                        e.target.value
                      )
                    }

                    className="
                      input-style
                      col-span-2
                    "
                  />

                  {/* RATE */}
                  <input
                    type="number"

                    value={
                      item.rate
                    }

                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "rate",
                        e.target.value
                      )
                    }

                    className="
                      input-style
                      col-span-2
                    "
                  />

                  {/* AMOUNT */}
                  <div className="
                    col-span-2
                    flex
                    items-center
                    gap-3
                  ">

                    <div className="
                      input-style
                      text-center
                    ">

                      {
                        item.amount.toFixed(2)
                      }

                    </div>

                    {/* DELETE */}
                    <button
                      onClick={() =>
                        removeItem(index)
                      }

                      className="
                        p-3
                        rounded-xl
                        bg-red-500/20
                        hover:bg-red-500/40
                        transition-all
                      "
                    >

                      <Trash2
                        size={18}
                      />

                    </button>

                  </div>

                </div>

              ))
            }

          </div>

          {/* ADD ITEM */}
          <button
            onClick={addItem}

            className="
              mt-8
              flex
              items-center
              gap-2
              bg-gradient-to-r
              from-blue-500
              to-purple-500
              px-6
              py-4
              rounded-2xl
              hover:scale-105
              transition-all
              duration-300
            "
          >

            <Plus size={18} />

            Add Line

          </button>

        </div>

        {/* TOTALS CARD */}
        <div className="
          bg-white/10
          backdrop-blur-xl
          border
          border-white/10
          rounded-3xl
          p-8
          shadow-2xl
        ">

          <div className="
            flex
            justify-end
          ">

            <div className="
              w-[400px]
              space-y-5
            ">

              {/* SUBTOTAL */}
              <div className="
                flex
                justify-between
                text-xl
              ">

                <span>
                  Subtotal
                </span>

                <span>
                  ₹
                  {
                    subtotal.toFixed(2)
                  }
                </span>

              </div>

              {/* TAX SECTION */}

<div className="space-y-4">

  {/* TOP */}
  <div className="
    flex
    justify-between
    items-center
  ">

    <button

      onClick={() =>
        setShowTaxDropdown(
          !showTaxDropdown
        )
      }

      className="
        px-5
        py-3
        rounded-2xl
        bg-white/10
        hover:bg-white/20
        transition-all
      "
    >

      {taxConfigured ? "Edit Tax" : "+ Add Tax"}

    </button>

    {
      taxConfigured && (

        <div className="
          flex
          items-center
          gap-6
        ">

          <div className="
            text-right
          ">

            <p className="
              text-slate-300
            ">
              {taxName}
            </p>

            <p className="
              text-green-400
              font-semibold
            ">
              +₹
              {
                taxTotal.toFixed(2)
              }
            </p>

          </div>

          <button
            onClick={() => {
              setTaxConfigured(false);
              setTaxName("");
              setTaxAmount(0);
              setShowTaxDropdown(false);
            }}
            className="
              px-3
              py-2
              rounded-lg
              bg-red-500/20
              hover:bg-red-500/40
              text-red-400
              transition-all
              text-sm
            "
          >
            Remove
          </button>

        </div>

      )
    }

  </div>

  {/* DROPDOWN */}
  {
    showTaxDropdown && (

      <div className="
        bg-white/5
        border
        border-white/10
        rounded-3xl
        p-6
        space-y-5
      ">

        {/* TAX NAME */}
        <input
          type="text"

          placeholder="
            Tax Name
          "

          value={taxName}

          onChange={(e)=>
            setTaxName(
              e.target.value
            )
          }

          className="
            input-style
          "
        />

        {/* RATE */}
        <input
          type="number"

          placeholder="
            Tax Amount
          "

          value={taxAmount}

          onChange={(e)=>
            setTaxAmount(
              e.target.value
            )
          }

          className="
            input-style
          "
        />

        {/* SET BUTTON */}
        <button

          onClick={() => {
            if (!taxName.trim()) {
              alert("Please enter tax name");
              return;
            }
            if (!taxAmount || taxAmount <= 0) {
              alert("Please enter valid tax amount");
              return;
            }
            setTaxConfigured(true);
            setShowTaxDropdown(false);
          }}

          className="
            px-6
            py-3
            rounded-2xl
            bg-gradient-to-r
            from-blue-500
            to-purple-500
            hover:scale-105
            transition-all
            w-full
          "
        >

          {taxConfigured ? "Update Tax" : "Set Tax"}

        </button>

      </div>

    )
  }

</div>

{/* DISCOUNT SECTION */}

<div className="space-y-4">

  {/* TOP */}
  <div className="
    flex
    justify-between
    items-center
  ">

    <button

      onClick={() =>
        setShowDiscountDropdown(
          !showDiscountDropdown
        )
      }

      className="
        px-5
        py-3
        rounded-2xl
        bg-white/10
        hover:bg-white/20
        transition-all
      "
    >

      {discountConfigured ? "Edit Discount" : "+ Add Discount"}

    </button>

    {
      discountConfigured && (

        <div className="
          flex
          items-center
          gap-6
        ">

          <div className="
            text-right
          ">

            <p className="
              text-slate-300
            ">
              {discountName}
            </p>

            <p className="
              text-red-400
              font-semibold
            ">
              -₹
              {
                discountTotal.toFixed(2)
              }
            </p>

          </div>

          <button
            onClick={() => {
              setDiscountConfigured(false);
              setDiscountName("");
              setDiscountAmount(0);
              setShowDiscountDropdown(false);
            }}
            className="
              px-3
              py-2
              rounded-lg
              bg-red-500/20
              hover:bg-red-500/40
              text-red-400
              transition-all
              text-sm
            "
          >
            Remove
          </button>

        </div>

      )
    }

  </div>

  {/* DROPDOWN */}
  {
    showDiscountDropdown && (

      <div className="
        bg-white/5
        border
        border-white/10
        rounded-3xl
        p-6
        space-y-5
      ">

        {/* NAME */}
        <input
          type="text"

          placeholder="
            Discount Name
          "

          value={discountName}

          onChange={(e)=>
            setDiscountName(
              e.target.value
            )
          }

          className="
            input-style
          "
        />

        {/* PERCENT */}
        <input
          type="number"

          placeholder="
            Discount Amount
          "

          value={discountAmount}

          onChange={(e)=>
            setDiscountAmount(
              e.target.value
            )
          }

          className="
            input-style
          "
        />

        {/* BUTTON */}
        <button

          onClick={() => {
            if (!discountName.trim()) {
              alert("Please enter discount name");
              return;
            }
            if (!discountAmount || discountAmount <= 0) {
              alert("Please enter valid discount amount");
              return;
            }
            setDiscountConfigured(true);
            setShowDiscountDropdown(false);
          }}

          className="
            px-6
            py-3
            rounded-2xl
            bg-gradient-to-r
            from-pink-500
            to-red-500
            hover:scale-105
            transition-all
            w-full
          "
        >

          {discountConfigured ? "Update Discount" : "Set Discount"}

        </button>

      </div>

    )
  }

</div>
              {/* TOTAL */}
              <div className="
                flex
                justify-between
                text-3xl
                font-bold
                border-t
                border-white/10
                pt-5
              ">

                <span>
                  Total
                </span>

                <span>
                  ₹
                  {
                    finalTotal.toFixed(2)
                  }
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default CreateInvoice;
import { useState } from "react";

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

  const [invoiceData,
    setInvoiceData] =
    useState({

      title: "Invoice",

      description: "",

      invoiceNumber: "INV-1",

      language: "English (US)",

      currency:
        "USD - United States Dollar",

      clientName: "",

      purchaseOrder: "",

      invoiceDate: "",

      dueDate: "Due on Receipt",

      notes: "",

      tax: 0,

      discount: 0,
  });

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

      (total, item) =>

        total +
        Number(item.amount),

      0
    );

  const taxAmount =
    subtotal *
    (
      Number(invoiceData.tax)
      / 100
    );

  const discountAmount =
    subtotal *
    (
      Number(invoiceData.discount)
      / 100
    );

  const finalTotal =
    subtotal +
    taxAmount -
    discountAmount;

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async () => {

    try {

      setLoading(true);

      const payload = {

        ...invoiceData,

        items,

        subtotal,

        taxAmount,

        discountAmount,

        finalTotal,
      };

      console.log(payload);

      // API CALL HERE

    } catch(error) {

      console.log(error);

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
              <button className="
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
                hover:cursor-grab active:cursor-grabbing
              ">

                YOUR LOGO

              </button>

              {/* CURRENCY */}
              <div className="w-full">

                <label className="
                  block
                  mb-3
                  text-slate-300
                ">  
                  Currency
                </label>

                <input
                  type="text"
                  name="currency"
                  value={
                    invoiceData.currency
                  }
                  onChange={handleChange}
                  className="input-style"
                />

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

                <select
                  name="dueDate"
                  value={
                    invoiceData.dueDate
                  }
                  onChange={handleChange}
                  className="input-style"
                >

                  <option>
                    Due on Receipt
                  </option>

                  <option>
                    Net 7
                  </option>

                  <option>
                    Net 15
                  </option>

                  <option>
                    Net 30
                  </option>

                </select>

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

              {/* TAX */}
              <div className="
                flex
                justify-between
                items-center
              ">

                <span>
                  Tax %
                </span>

                <input
                  type="number"
                  name="tax"
                  value={
                    invoiceData.tax
                  }
                  onChange={handleChange}
                  className="
                    input-style
                    w-[120px]
                  "
                />

              </div>

              {/* DISCOUNT */}
              <div className="
                flex
                justify-between
                items-center
              ">

                <span>
                  Discount %
                </span>

                <input
                  type="number"
                  name="discount"
                  value={
                    invoiceData.discount
                  }
                  onChange={handleChange}
                  className="
                    input-style
                    w-[120px]
                  "
                />

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
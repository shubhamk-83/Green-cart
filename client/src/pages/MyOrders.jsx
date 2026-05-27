import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const MyOrders = () => {
  const [MyOrders, setMyOrders] = useState([]);
  const { axios, currency, user } = useAppContext();

  // Fetch Orders
  const fetchMyOrders = async () => {
    try {
      const { data } = await axios.get("/api/order/user");

      if (data.success) {
        setMyOrders(data.orders);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyOrders();
    }
  }, [user]);

  return (
    <div className="mt-16 pb-16 px-4 md:px-10 lg:px-16">
      
      {/* Heading */}
      <div className="mb-10">
        <p className="text-3xl font-semibold uppercase text-gray-800">
          My Orders
        </p>

        <div className="w-20 h-1 bg-primary rounded-full mt-2"></div>
      </div>

      {/* Empty Orders */}
      {MyOrders.length === 0 ? (
        <div className="border border-gray-200 rounded-xl p-10 text-center bg-white shadow-sm">
          <p className="text-gray-500 text-lg">
            No Orders Found
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          
          {MyOrders.map((order, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden"
            >
              
              {/* Top Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-5 bg-gray-50 border-b border-gray-200">
                
                <div>
                  <p className="text-sm text-gray-500">
                    Order ID
                  </p>

                  <p className="font-medium text-gray-800 break-all">
                    {order._id}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Payment
                  </p>

                  <p className="font-medium text-gray-800">
                    {order.paymentType}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Total Amount
                  </p>

                  <p className="font-semibold text-lg text-primary">
                    {currency}
                    {order.amount}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6 flex flex-col gap-6">
                
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 border border-gray-100 rounded-xl p-5 hover:shadow-md transition-all duration-200"
                  >
                    
                    {/* Left Side */}
                    <div className="flex items-center gap-5">
                      
                      {/* Product Image */}
                      <div className="border border-gray-200 rounded-xl p-2 bg-gray-50">
                        <img
                          src={item.product?.image[0]}
                          alt={item.product?.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="space-y-1">
                        <p className="text-lg font-semibold text-gray-800">
                          {item.product?.name}
                        </p>

                        <p className="text-sm text-gray-500">
                          Category : {item.product?.category}
                        </p>

                        <p className="text-sm text-gray-500">
                          Quantity : {item.quantity}
                        </p>
                      </div>
                    </div>

                    {/* Middle */}
                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                      
                      <p>
                        <span className="font-medium">
                          Status :
                        </span>{" "}
                        <span className="text-green-600 font-medium">
                          {order.status || "Order Placed"}
                        </span>
                      </p>

                      <p>
                        <span className="font-medium">
                          Date :
                        </span>{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>

                      <p>
                        <span className="font-medium">
                          Payment :
                        </span>{" "}
                        {order.paymentType}
                      </p>
                    </div>

                    {/* Right Side */}
                    <div className="lg:text-right">
                      <p className="text-sm text-gray-500 mb-1">
                        Amount
                      </p>

                      <p className="text-2xl font-bold text-green-600">
                        {currency}
                        {item.product?.offerPrice * item.quantity}
                      </p>
                    </div>

                  </div>
                ))}

              </div>

            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default MyOrders;
import React, { useState } from 'react'
import "./AddProducts.css"
import axios from 'axios';
import Swal from 'sweetalert2';


function AddProducts() {
    const apiUrl = import.meta.env.VITE_API_PRODUCTS_URL

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        description: ""
    })

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => (
            {
                ...prev,
                [name]: value,
            }
        ));

    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all fields
        if (
            !formData.name.trim() ||
            !formData.price.trim() ||
            !formData.description.trim()
        ) {
            Swal.fire({
                icon: 'warning',
                title: 'Incomplete Form',
                text: 'Please fill all fields before submitting.',
                confirmButtonColor: '#f8bb86',
            });
            return;
        }

        const productData = {
            name: formData.name,
            price: formData.price,
            description: formData.description,
        };


        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`${apiUrl}product/`, productData, {
                headers: {
                    Authorization: `Token ${token}`
                }
            });


            if (response.status === 200 && response.data.statuscode === 201) {
                setFormData({
                    name: "",
                    price: "",
                    description: ""
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Product Added!',
                    text: 'The product was added successfully.',
                    confirmButtonColor: '#3085d6',
                });
            } else {
                // Unexpected response
                Swal.fire({
                    icon: 'error',
                    title: 'Unexpected Response',
                    text: 'The server did not return a success status.',
                    confirmButtonColor: '#d33',
                });
            }

        } catch (error) {
            console.error('Product add Error:', error.response?.data || error.message);

            Swal.fire({
                icon: 'error',
                title: 'Failed to Add Product',
                text: error.response?.data?.detail || 'Something went wrong.',
                confirmButtonColor: '#d33',
            });
        }
    };







    return (
        <div className="login-main">
            <div className="login-container">
                <h1>Add Products</h1>


                <form onSubmit={handleSubmit} >
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Product Name"
                            className="add-products-input"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="number"
                            placeholder="Price"
                            className="add-products-input"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                        />

                        <textarea
                            type="text"
                            placeholder="Description"
                            className="add-products-input"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />



                    </div>

                    <button type="submit" className="submit-product" >
                        Add Product
                    </button>
                </form>

            </div>
        </div>
    )
}

export default AddProducts
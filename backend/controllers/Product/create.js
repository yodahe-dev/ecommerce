const jwt = require('jsonwebtoken');
const axios = require('axios');
const { Product, User, Role } = require('../../models');

// Upload image to UploadThing
const uploadImageToUploadThing = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await axios.post(
      'https://api.uploadthing.com/v1/files',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.UPLOADTHING_SECRET}`, // Use your secret key
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data[0]?.url;  // Return the URL of the uploaded image
  } catch (err) {
    console.error('Image upload failed:', err);
    throw new Error('Failed to upload image');
  }
};

module.exports = async (req, res) => {
  const {
    name,
    description,
    price,
    quantity,
    lastPrice,
  } = req.body;

  const image = req.files?.image;  // Assuming `image` is the name of the field

  // Check if the Authorization header exists
  const token = req.headers.authorization?.split(' ')[1];  // Get token from header

  if (!token) {
    return res.status(400).json({ message: "User must log in" });
  }

  try {
    // Verify token and extract userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Use your JWT secret here
    const userId = decoded.id;  // Extract userId from decoded token

    const user = await User.findOne({
      where: { id: userId },
      include: [{ model: Role, as: 'role', attributes: ['name'] }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const allowedRoles = ['seller', 'admin', 'manager'];
    const userRole = user.role?.name;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "You are not allowed to create products" });
    }

    // Upload the image if it's available
    let imageUrl = null;
    if (image) {
      imageUrl = await uploadImageToUploadThing(image);
    }

    // Create the product
    const newProduct = await Product.create({
      name,
      description,
      price,
      quantity,
      imageUrl, // Save the uploaded image URL
      lastPrice,
      userId,
    });

    return res.status(201).json(newProduct);
  } catch (err) {
    console.error('Create product failed:', err);
    return res.status(500).json({
      message: 'Internal server error. Failed to create product.',
      error: err.message,
    });
  }
};

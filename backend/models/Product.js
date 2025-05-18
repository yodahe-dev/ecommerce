module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    lastPrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    mainImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    extraImages: {
      type: DataTypes.JSON, // array of image URLs
      allowNull: true,
    },
    sizes: {
      type: DataTypes.JSON, // array or object, like ['S','M','L'] or {M: 10, L: 4}
      allowNull: true,
    },
    shippingPrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    condition: {
      type: DataTypes.ENUM('new', 'used', 'refurbished', 'other'),
      defaultValue: 'new',
    },
  }, {
    timestamps: true, // <-- this fixes your error
  });

  Product.associate = (models) => {
    Product.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return Product;
};

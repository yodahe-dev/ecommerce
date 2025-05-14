module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define('Cart', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users', // Ensure the Users model is properly defined
        key: 'id',
      },
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Products', // Ensure the Products model is properly defined
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1, // Default to 1 if no quantity is specified
      validate: {
        min: 1, // The minimum quantity can be 1
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'active', // Status can be 'active', 'removed', etc.
    },
  }, {
    timestamps: true,
  });

  Cart.associate = (models) => {
    Cart.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    Cart.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product',
    });
  };

  return Cart;
};

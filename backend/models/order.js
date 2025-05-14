module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    paymentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Payments',
        key: 'id',
      },
    },
    orderStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending', // Can be 'pending', 'completed', 'canceled'
    },
    totalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  }, {
    timestamps: true,
  });

  Order.associate = (models) => {
    Order.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    Order.belongsTo(models.Payment, {
      foreignKey: 'paymentId',
      as: 'payment',
    });

    // Linking the Order to Cart (assuming each Order can have many Cart items)
    Order.hasMany(models.Cart, {
      foreignKey: 'orderId', // Make sure Cart model has 'orderId' field
      as: 'carts',
    });
  };

  return Order;
};

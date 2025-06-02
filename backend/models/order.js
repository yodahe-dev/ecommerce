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
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'id',
      },
    },
    orderStatus: {
      type: DataTypes.ENUM('expired', 'pending', 'paid'),
      defaultValue: 'paid',
      allowNull: false,
    },
    receiveStatus: {
      type: DataTypes.ENUM('not_received', 'received', 'refunded', 'refunding'),
      defaultValue: 'not_received',
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('notes');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('notes', JSON.stringify(value));
      },
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^9\d{8}$/,
      },
    },
    additionalphone: {  // fixed spelling here
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^9\d{8}$/,
      },
    },
  });

  Order.associate = (models) => {
    Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Order.belongsTo(models.Payment, { foreignKey: 'paymentId', as: 'payment' });
    Order.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
  };

  return Order;
};
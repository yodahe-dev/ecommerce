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
      allowNull: false, // required
      references: {
        model: 'Products', // fixed table name
        key: 'id',
      },
    },

    orderStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
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
      }
    },

    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^9\d{8}$/, // must start with 9 and be 9 digits (Ethiopia)
      },
    },

    addtionalphone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^9\d{8}$/, // must start with 9 and be 9 digits (Ethiopia)
      },
    },
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

    Order.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product',
    });
  };

  return Order;
};

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isDiscounted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    lastPrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    currentPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    isSold: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    timestamps: true,
  });

  Product.associate = (models) => {
    Product.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return Product;
};
